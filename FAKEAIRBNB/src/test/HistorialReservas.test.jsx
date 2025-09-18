import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HistorialReservas from "../pages/HistorialReservas/HistorialReservas";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from "firebase/firestore";

vi.mock("../firebase/firebaseConfig", () => ({
  __esModule: true,
  default: {},   
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
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

describe("HistorialReservas.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Muestra mensaje de carga y luego sin reservas", async () => {
    useAuth.mockReturnValue({ usuario: { email: "test@test.com" } });
    getDocs.mockResolvedValueOnce({ docs: [] }); 

    render(
      <MemoryRouter>
        <HistorialReservas />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando reservas/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/No tienes reservas registradas/i)).toBeInTheDocument()
    );
  });

  it("Confirma calificación y elimina reserva", async () => {
    useAuth.mockReturnValue({ usuario: { email: "confirm@test.com" } });

    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "res3",
          data: () => ({
            titulo: "Casa por calificar",
            ubicacion: "Cali",
            fechaInicio: "2020-01-01",
            fechaFin: "2020-01-02",
            precioPorNoche: 150,
            totalPrecio: 300,
            usuarioId: "u3",
          }),
        },
      ],
    });
    getDocs.mockResolvedValueOnce({ empty: true });
    addDoc.mockResolvedValueOnce({ id: "newCalif" });
    deleteDoc.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <HistorialReservas />
      </MemoryRouter>
    );

    const calificarBtn = await screen.findByText(/Calificar estadía/i);
    fireEvent.click(calificarBtn);

    const confirmarBtn = await screen.findByText("Confirmar");
    fireEvent.click(confirmarBtn);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
      expect(
        screen.getByText(/La reserva ha sido liberada y calificada correctamente/i)
      ).toBeInTheDocument();
    });
  });
});
