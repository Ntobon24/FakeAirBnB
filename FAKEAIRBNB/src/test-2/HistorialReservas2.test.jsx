import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HistorialReservas from "../pages/HistorialReservas/HistorialReservas";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from "firebase/firestore";

vi.mock("../firebase/firebaseConfig", () => ({ __esModule: true, default: {} }));
vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}));
vi.mock("../components/ServiceRating/ServiceRating", () => ({
  __esModule: true,
  default: ({ onClose, onConfirm }) => (
    <div data-testid="mock-service-rating">
      <button onClick={() => onClose()}>Cerrar</button>
      <button onClick={() => onConfirm({ rating: 5 })}>Confirmar</button>
    </div>
  ),
}));

const renderSUT = () =>
  render(
    <MemoryRouter>
      <HistorialReservas />
    </MemoryRouter>
  );

const reservaDoc = (id, overrides = {}) => ({
  id,
  data: () => ({
    titulo: `Casa ${id}`,
    ubicacion: "Medellín",
    fechaInicio: "2025-08-01",
    fechaFin: "2025-08-05",
    precioPorNoche: 200,
    totalPrecio: 400,
    usuarioId: "u1",
    usuarioEmail: "test@test.com",
    ...overrides,
  }),
});

describe("HistorialReservas.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ usuario: { email: "test@test.com" } });
    collection.mockReturnValue({});
    query.mockReturnValue({});
    where.mockReturnValue({});
    doc.mockReturnValue({});
    console.error = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("Renderiza reservas cuando existen y oculta el estado de carga", async () => {
    getDocs.mockResolvedValueOnce({ docs: [reservaDoc("r1"), reservaDoc("r2")] })
           .mockResolvedValue({ empty: true, docs: [] });
    renderSUT();
    expect(screen.getByText(/Cargando reservas/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Cargando reservas/i)).toBeNull();
      expect(screen.getByText("Casa r1")).toBeInTheDocument();
      expect(screen.getByText("Casa r2")).toBeInTheDocument();
    });
  });

  it("Abre el modal de calificación y luego lo cierra (onClose)", async () => {
    getDocs.mockResolvedValueOnce({ docs: [reservaDoc("r1")] })
           .mockResolvedValueOnce({ empty: true, docs: [] });
    renderSUT();
    const calificar = await screen.findByText(/Calificar estadía/i);
    fireEvent.click(calificar);
    expect(screen.getByTestId("mock-service-rating")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cerrar"));
    await waitFor(() => {
      expect(screen.queryByTestId("mock-service-rating")).toBeNull();
    });
  });

  it("Renderiza correctamente el estado 'Finalizada' para reservas pasadas sin calificación", async () => {
    getDocs
      .mockResolvedValueOnce({ docs: [reservaDoc("r1")] })
      .mockResolvedValueOnce({ empty: true, docs: [] }); 
    renderSUT();
    
    await waitFor(() => {
      expect(screen.getByText("Casa r1")).toBeInTheDocument();
      expect(screen.getByText("Finalizada")).toBeInTheDocument();
      expect(screen.getByText(/Calificar estadía/i)).toBeInTheDocument();
    });
    
    const estadoElement = screen.getByText("Finalizada").closest("p");
    expect(estadoElement).toHaveClass("estado-reserva", "reserva-finalizada");
  });

  it("Maneja error al cargar reservas (getDocs falla) y loggea el error", async () => {
    getDocs.mockRejectedValueOnce(new Error("Firestore error"));
    renderSUT();
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(expect.anything(), expect.any(Error));
    });
  });

  it("Maneja error al guardar calificación (addDoc falla) sin eliminar la reserva", async () => {
    getDocs
      .mockResolvedValueOnce({ docs: [reservaDoc("r1")] })
      .mockResolvedValueOnce({ empty: true, docs: [] });
    addDoc.mockRejectedValueOnce(new Error("addDoc fail"));
    renderSUT();
    const calificar = await screen.findByText(/Calificar estadía/i);
    fireEvent.click(calificar);
    fireEvent.click(screen.getByText("Confirmar"));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(deleteDoc).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  it("Muestra mensaje 'No tienes reservas' cuando la lista está vacía", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    renderSUT();
    
    
    expect(screen.getByText(/Cargando reservas/i)).toBeInTheDocument();
    
  
    await waitFor(() => {
      expect(screen.queryByText(/Cargando reservas/i)).toBeNull();
      expect(screen.getByText(/No tienes reservas registradas/i)).toBeInTheDocument();
      expect(screen.queryByRole("list")).toBeNull();
    });
  });

  it("Flujo completo: califica y libera la reserva (addDoc y deleteDoc llamados)", async () => {
    getDocs
      .mockResolvedValueOnce({ docs: [reservaDoc("r1")] })
      .mockResolvedValueOnce({ empty: true, docs: [] }); 
    addDoc.mockResolvedValueOnce({ id: "rate-ok" });
    deleteDoc.mockResolvedValueOnce({});
    renderSUT();
    const calificar = await screen.findByText(/Calificar estadía/i);
    fireEvent.click(calificar);
    fireEvent.click(screen.getByText("Confirmar"));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/La reserva ha sido liberada y calificada correctamente/i)
      ).toBeInTheDocument();
    });
  });

  it("Mantiene independencia: segundo render con reservas distintas no filtra datos anteriores", async () => {
    getDocs.mockResolvedValueOnce({ docs: [reservaDoc("r1")] })
           .mockResolvedValueOnce({ empty: true, docs: [] }); 
    const { rerender } = renderSUT();
    await waitFor(() => {
      expect(screen.getByText("Casa r1")).toBeInTheDocument();
    });
    getDocs.mockResolvedValueOnce({ docs: [reservaDoc("rX")] })
           .mockResolvedValueOnce({ empty: true, docs: [] }); 
    rerender(
      <MemoryRouter>
        <HistorialReservas />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText("Casa r1")).toBeNull();
      expect(screen.getByText("Casa rX")).toBeInTheDocument();
    });
  });
});
