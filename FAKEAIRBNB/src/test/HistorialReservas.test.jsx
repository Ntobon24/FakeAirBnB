import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createContext } from "react";

const AuthContext = createContext();
import HistorialReservas from "../pages/HistorialReservas/HistorialReservas";

vi.mock("../firebase/firebaseConfig", () => ({
  default: {}, // simula tu `app`
}));

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(() => ({})), 
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
  };
});

const mockAuthContext = {
  usuario: {
    uid: "test-user-id",
    email: "test@example.com",
  },
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

//Mock para el router no redirigir
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

//mock modal para calificar
vi.mock("../components/ServiceRating/ServiceRating", () => ({
  __esModule: true,
  default: ({ onConfirm }) => (
    <button data-testid="mock-service-rating" onClick={() => onConfirm({ puntuacion: 5 })}>
      Calificar reserva
    </button>
  ),
}));

const renderWithProviders = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe("HistorialReservas component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensaje de cargando", () => {
    renderWithProviders(<HistorialReservas />);
    expect(screen.getByText("Cargando reservas...")).toBeInTheDocument();
  });

  it("muestra mensaje si no hay reservas", async () => {
    const { getDocs } = await import("firebase/firestore");
    getDocs.mockResolvedValueOnce({ docs: [], empty: true });

    renderWithProviders(<HistorialReservas />);

    await waitFor(() => {
      expect(
        screen.getByText("No tienes reservas registradas.")
      ).toBeInTheDocument();
    });
  });

  it("muestra una reserva activa", async () => {
    const { getDocs } = await import("firebase/firestore");

    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 3);

    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: "res1",
          data: () => ({
            titulo: "Casa en la playa",
            ubicacion: "Cancún",
            fechaInicio: new Date().toISOString(),
            fechaFin: fechaFutura.toISOString(),
            precioPorNoche: 100,
            totalPrecio: 300,
            usuarioId: "test-user-id",
            usuarioEmail: "test@example.com",
          }),
        },
      ],
    });

    renderWithProviders(<HistorialReservas />);

    await waitFor(() => {
      expect(screen.getByText(/Casa en la playa/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancún/i)).toBeInTheDocument();
      expect(screen.getByText(/Activa/i)).toBeInTheDocument(); 
    });
  });


})
