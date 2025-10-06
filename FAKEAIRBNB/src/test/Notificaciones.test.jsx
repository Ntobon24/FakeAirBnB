
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let Notificaciones;

let mockUsuario = { uid: "user-123", email: "test@fake.com" };
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ usuario: mockUsuario }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

const collectionMock = vi.fn();
const whereMock = vi.fn();
const queryMock = vi.fn();
const getDocsMock = vi.fn();
const deleteDocMock = vi.fn();
const docMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: (...args) => collectionMock(...args),
  where: (...args) => whereMock(...args),
  query: (...args) => queryMock(...args),
  getDocs: (...args) => getDocsMock(...args),
  deleteDoc: (...args) => deleteDocMock(...args),
  doc: (...args) => docMock(...args),
}));

vi.mock("../firebase/firebaseConfig", () => ({ db: { __FAKE__: true } }));

const makeSnap = (docsArray) => ({
  docs: docsArray.map(({ id, data }) => ({ id, data: () => data })),
});

const makeNotif = (over = {}) => ({
  id: "n-1",
  titulo: "Cabaña del Lago",
  ubicacion: "Guatapé",
  propiedadId: "prop-9",
  fechaInicio: "2025-01-10T00:00:00.000Z",
  fechaFin: "2025-01-15T00:00:00.000Z",
  fechaSuscripcion: { toDate: () => new Date("2025-01-05T12:00:00.000Z") },
  ...over,
});

const mockGetDocsOnce = (arr) => {
  getDocsMock.mockResolvedValueOnce(makeSnap(arr));
};

const findCardByTitle = async (title) => {
  const h = await screen.findByText(title);
  return h.closest(".notificacion-card");
};

beforeEach(async () => {
  vi.clearAllMocks();
  mockUsuario = { uid: "user-123", email: "test@fake.com" };
  Notificaciones = (await import("../pages/Notificaciones/Notificaciones")).default;
});


describe("Notificaciones (5 pruebas buenas)", () => {
  it(" Sin usuario: redirige a '/' y no consulta Firestore", async () => {
    mockUsuario = null;
    render(<Notificaciones />);
    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(getDocsMock).not.toHaveBeenCalled();
  });

  it(" Loading -> resuelto: desaparece el 'Cargando...' y muestra estado vacío", async () => {
    mockGetDocsOnce([]);
    render(<Notificaciones />);
    expect(screen.getByText(/cargando notificaciones/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(/cargando notificaciones/i)).not.toBeInTheDocument()
    );
    await screen.findByText(/mis notificaciones de disponibilidad/i);
    expect(screen.getByText(/no tienes notificaciones activas/i)).toBeInTheDocument();
  });

  it(" CTA en estado vacío: 'Explorar Propiedades' navega a '/'", async () => {
    mockGetDocsOnce([]);
    const user = userEvent.setup();
    render(<Notificaciones />);
    const btn = await screen.findByRole("button", { name: /explorar propiedades/i });
    await user.click(btn);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it(" Lista con 1 ítem: renderiza datos, arma la query por usuario y 'Ver Propiedad' navega a /reserva/:id", async () => {
    mockGetDocsOnce([{ id: "n-1", data: makeNotif() }]);
    const user = userEvent.setup();
    render(<Notificaciones />);

    await screen.findByText(/mis notificaciones de disponibilidad/i);
    const card = await findCardByTitle("Cabaña del Lago");
    const inCard = within(card);

    expect(inCard.getByText("Cabaña del Lago")).toBeInTheDocument();
    expect(inCard.getByText("Guatapé")).toBeInTheDocument();
    expect(inCard.getByText(/activa/i)).toBeInTheDocument();

    const whereOk = whereMock.mock.calls.some(
      (args) => args[0] === "usuarioId" && args[1] === "==" && args[2] === "user-123"
    );
    const collectionOk = collectionMock.mock.calls.some(
      (args) => args[1] === "notificaciones_disponibilidad"
    );
    expect(whereOk).toBe(true);
    expect(collectionOk).toBe(true);

    const verBtn = inCard.getByRole("button", { name: /ver propiedad/i });
    await user.click(verBtn);
    expect(navigateMock).toHaveBeenCalledWith("/reserva/prop-9");
  });

  it(" Eliminar: llama deleteDoc y la tarjeta desaparece del DOM", async () => {
    docMock.mockReturnValueOnce({ __DOC__: true });
    deleteDocMock.mockResolvedValueOnce();

    mockGetDocsOnce([{ id: "n-1", data: makeNotif() }]);
    const user = userEvent.setup();
    render(<Notificaciones />);

    const card = await findCardByTitle("Cabaña del Lago");
    const btnEliminar = within(card).getByRole("button", { name: /eliminar/i });
    await user.click(btnEliminar);

    await waitFor(() => expect(deleteDocMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByText("Cabaña del Lago")).not.toBeInTheDocument()
    );
  });
});
