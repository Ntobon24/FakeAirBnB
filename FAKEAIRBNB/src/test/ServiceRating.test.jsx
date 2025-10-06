
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServiceRating from "../components/ServiceRating/ServiceRating";

const getDocMock = vi.fn();
const docMock = vi.fn();
vi.mock("firebase/firestore", () => ({
  doc: (...args) => docMock(...args),
  getDoc: (...args) => getDocMock(...args),
}));


vi.mock("../../firebase/firebaseConfig", () => ({
  db: { __FAKE__: true },
}));

const baseReserva = {
  id: "res-1",
  usuarioId: "user-1",
  propiedadId: "prop-1",
  usuarioEmail: "demo@fake.com",
};

const makeDocSnap = ({ exists = true, id = "prop-1", data = {} } = {}) => ({
  id,
  exists: () => exists,
  data: () => data,
});

beforeEach(() => {
  
  getDocMock.mockResolvedValue(
    makeDocSnap({
      exists: true,
      id: "prop-1",
      data: {
        titulo: "Casa de Prueba",
        FotosPropiedad: ["https://img.test/uno.jpg"],
      },
    })
  );
});

describe("ServiceRating", () => {
  it("Muestra 'Cargando...' y luego renderiza la info de la propiedad (título e imagen)", async () => {
    render(
      <ServiceRating reserva={baseReserva} onClose={() => {}} onConfirm={() => {}} />
    );

    
    expect(
      screen.getByText(/cargando informacion de la propiedad/i)
    ).toBeInTheDocument();

    
    const title = await screen.findByText("Casa de Prueba");
    expect(title).toBeInTheDocument();

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://img.test/uno.jpg");
  });

  it("Seleccionar estrellas actualiza el puntaje y muestra la descripción correcta", async () => {
    const user = userEvent.setup();
    render(
      <ServiceRating reserva={baseReserva} onClose={() => {}} onConfirm={() => {}} />
    );

    await screen.findByText("Casa de Prueba");

    
    const starButtons = screen.getAllByRole("button", { name: "★" });
    await user.click(starButtons[2]); 

  
    expect(screen.getByText(/regular/i)).toBeInTheDocument();
  });

  it("Click en 'Cancelar' llama a onClose exactamente una vez", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ServiceRating reserva={baseReserva} onClose={onClose} onConfirm={() => {}} />
    );

    await screen.findByText("Casa de Prueba");

    const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
    await user.click(btnCancelar);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Intentar enviar sin seleccionar puntaje muestra error", async () => {
    const user = userEvent.setup();

    render(
      <ServiceRating reserva={baseReserva} onClose={() => {}} onConfirm={() => {}} />
    );

    await screen.findByText("Casa de Prueba");

    const btnEnviar = screen.getByRole("button", { name: /enviar calificacion/i });
    await user.click(btnEnviar);

    expect(
      screen.getByText(/selecciona un puntaje de estrellas válido/i)
    ).toBeInTheDocument();
  });

  it("Con puntaje y comentario válidos, llama a onConfirm con el payload esperado", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ServiceRating reserva={baseReserva} onClose={() => {}} onConfirm={onConfirm} />
    );

    await screen.findByText("Casa de Prueba");


    const starButtons = screen.getAllByRole("button", { name: "★" });
    await user.click(starButtons[4]); 

    
    const textarea = screen.getByPlaceholderText(/agrega un comentario/i);
    await user.type(textarea, "Excelente lugar!");

    
    const btnEnviar = screen.getByRole("button", { name: /enviar calificacion/i });
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    const payload = onConfirm.mock.calls[0][0];
    expect(payload).toMatchObject({
      reservaId: baseReserva.id,
      usuarioId: baseReserva.usuarioId,
      propiedadId: baseReserva.propiedadId,
      usuarioEmail: baseReserva.usuarioEmail,
      puntaje: 5,
      comentario: "Excelente lugar!",
    });
    expect(typeof payload.fechaPublicacion).toBe("string");
  });
});
