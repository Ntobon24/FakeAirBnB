import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Reserva from "../pages/Reserva/Reserva";

const mockNavigate = vi.fn();
const mockDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockCollection = vi.fn();
const mockGetDocs = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockAddDoc = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: () => mockNavigate,
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: vi.fn(),
}));

vi.mock("../firebase/firebaseConfig", () => ({
  default: {},
  db: {},
  auth: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  collection: (...args) => mockCollection(...args),
  getDocs: (...args) => mockGetDocs(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  addDoc: (...args) => mockAddDoc(...args),
}));

vi.mock("react-datepicker", () => {
  return {
    default: ({ selected, onChange, minDate, excludeDates }) => (
      <input
        data-testid="datepicker"
        value={selected ? selected.toISOString().split("T")[0] : ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value && value.trim() !== "") {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              onChange(date);
            }
          } else {
            onChange(null);
          }
        }}
        min={minDate ? minDate.toISOString().split("T")[0] : ""}
        data-exclude-dates={excludeDates ? excludeDates.length : 0}
      />
    ),
  };
});

vi.mock("../components/Gallery/Gallery", () => ({
  default: () => <div data-testid="gallery">Gallery Component</div>,
}));

vi.mock("../components/PasarelaPagosFake/PasarelaPagosFake", () => ({
  default: ({ onClose, onConfirm }) => (
    <div data-testid="pasarela">
      <button onClick={onClose}>Cerrar</button>
      <button onClick={onConfirm}>Confirmar Pago</button>
    </div>
  ),
}));

vi.mock("../components/CommentsList/CommentsList", () => ({
  default: () => <div data-testid="comments">Comments Component</div>,
}));

vi.mock("../pages/RegistroInicio/Login", () => ({
  default: () => <div data-testid="login">Login Component</div>,
}));

const createMockPropiedad = (overrides = {}) => ({
  id: "prop1",
  titulo: "Casa en la playa",
  ubicacion: "Cancún, México",
  descripcion: "Hermosa casa frente al mar",
  clima: "Tropical",
  habitaciones: 3,
  banos: 2,
  maxPersonas: 6,
  mascotasPermitidas: true,
  wifi: true,
  piscina: true,
  aireAcondicionado: true,
  parqueadero: true,
  precio: 150000,
  comodidades: ["Cocina", "TV", "WiFi"],
  reglas: ["No fumar", "No mascotas"],
  FotosPropiedad: ["url1", "url2"],
  ...overrides,
});

const createMockUser = (overrides = {}) => ({
  uid: "user123",
  email: "test@example.com",
  ...overrides,
});

const createMockDocSnapshot = (propiedad = createMockPropiedad()) => ({
  exists: () => true,
  id: propiedad.id,
  data: () => propiedad,
});

const createMockReservasSnapshot = (reservas = []) => ({
  forEach: (cb) => reservas.forEach((r) => cb({ data: () => r })),
});

beforeEach(() => {
  vi.clearAllMocks();
  useParams.mockReturnValue({ id: "prop1" });
  useAuthState.mockReturnValue([createMockUser(), false, null]);
  mockDoc.mockReturnValue({});
  mockGetDoc.mockResolvedValue(createMockDocSnapshot());
  mockCollection.mockReturnValue({});
  mockQuery.mockReturnValue({});
  mockWhere.mockReturnValue({});
  mockGetDocs.mockResolvedValue(createMockReservasSnapshot([]));
  mockAddDoc.mockResolvedValue({ id: "res-123" });
});

describe("Reserva Componente", () => {
  describe("Inicializacion del Componente", () => {
    it("debe mostrar estado de carga inicialmente", () => {
      mockGetDoc.mockImplementation(() => new Promise(() => {}));

      render(<Reserva />);

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    it("debe cargar y mostrar informacion de la propiedad", async () => {
      const mockPropiedad = createMockPropiedad();

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Hermosa casa frente al mar")
      ).toBeInTheDocument();
      expect(screen.getByText("Ubicación: Cancún, México")).toBeInTheDocument();
    });

    it("debe mostrar comodidades y reglas de la propiedad", async () => {
      const mockPropiedad = createMockPropiedad();

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("🏠 3 habitaciones")).toBeInTheDocument();
      });

      expect(screen.getByText("🚿 2 baños")).toBeInTheDocument();
      expect(
        screen.getByText("👥 Capacidad máxima: 6 personas")
      ).toBeInTheDocument();
    });
  });

  describe("Manejo de Autenticacion", () => {
    it("debe mostrar componente de login cuando el usuario no esta autenticado", async () => {
      useAuthState.mockReturnValue([null, false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByTestId("login")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /reservar/i })
      ).not.toBeInTheDocument();
    });

    it("debe mostrar boton de reserva cuando el usuario esta autenticado", async () => {
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /reservar/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Seleccion de Fechas", () => {
    it("debe deshabilitar boton de reserva cuando no hay fechas seleccionadas", async () => {
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        const reservarBtn = screen.getByRole("button", { name: /reservar/i });
        expect(reservarBtn).toBeDisabled();
      });
    });

    it("debe habilitar boton de reserva cuando se seleccionan fechas validas", async () => {
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2025-05-20" } });
      fireEvent.change(endInput, { target: { value: "2025-05-25" } });

      await waitFor(() => {
        const reservarBtn = screen.getByRole("button", { name: /reservar/i });
        expect(reservarBtn).not.toBeDisabled();
      });
    });
  });

  describe("Proceso de Reserva", () => {
    it("debe mostrar error al intentar reservar sin autenticacion", async () => {
      useAuthState.mockReturnValue([null, false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      expect(screen.getByTestId("login")).toBeInTheDocument();
    });

    it("debe mostrar error cuando las fechas se solapan con reservas existentes", async () => {
      useAuthState.mockReturnValue([createMockUser(), false, null]);
      mockGetDocs.mockResolvedValueOnce(
        createMockReservasSnapshot([
          {
            fechaInicio: "2024-02-01T00:00:00.000Z",
            fechaFin: "2024-02-05T00:00:00.000Z",
          },
        ])
      );

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2024-02-02" } });
      fireEvent.change(endInput, { target: { value: "2024-02-04" } });

      fireEvent.click(screen.getByRole("button", { name: /reservar/i }));

      expect(
        await screen.findByText(
          /Lo sentimos, estas fechas ya están reservadas\./i
        )
      ).toBeInTheDocument();
    });

    it("debe abrir pasarela de pago cuando la reserva es valida", async () => {
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2025-03-10" } });
      fireEvent.change(endInput, { target: { value: "2025-03-15" } });

      fireEvent.click(screen.getByRole("button", { name: /reservar/i }));

      expect(await screen.findByTestId("pasarela")).toBeInTheDocument();
    });
  });

  describe("Confirmacion de Pago", () => {
    it("debe crear reserva cuando se confirma el pago", async () => {
      const user = userEvent.setup();
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2025-03-10" } });
      fireEvent.change(endInput, { target: { value: "2025-03-15" } });

      await user.click(screen.getByRole("button", { name: /reservar/i }));
      await user.click(screen.getByRole("button", { name: /confirmar pago/i }));

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalledTimes(1);
      });
    });

    it("debe cerrar pasarela de pago despues de reserva exitosa", async () => {
      const user = userEvent.setup();
      useAuthState.mockReturnValue([createMockUser(), false, null]);

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2025-03-10" } });
      fireEvent.change(endInput, { target: { value: "2025-03-15" } });

      await user.click(screen.getByRole("button", { name: /reservar/i }));
      expect(await screen.findByTestId("pasarela")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /confirmar pago/i }));

      await waitFor(() => {
        expect(screen.queryByTestId("pasarela")).not.toBeInTheDocument();
      });
    });
  });

  describe("Manejo de Errores", () => {
    it("debe manejar propiedad no encontrada", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const mockDocSnapshot = { exists: () => false };
      mockGetDoc.mockResolvedValue(mockDocSnapshot);

      render(<Reserva />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("No existe la propiedad");
      });

      consoleSpy.mockRestore();
    });

    it("debe manejar errores de Firebase durante la reserva", async () => {
      const user = userEvent.setup();
      useAuthState.mockReturnValue([createMockUser(), false, null]);
      mockAddDoc.mockRejectedValue(new Error("Firebase error"));

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByText("Casa en la playa")).toBeInTheDocument();
      });

      const [startInput, endInput] = screen.getAllByTestId("datepicker");
      fireEvent.change(startInput, { target: { value: "2025-03-10" } });
      fireEvent.change(endInput, { target: { value: "2025-03-15" } });

      await user.click(screen.getByRole("button", { name: /reservar/i }));
      await user.click(screen.getByRole("button", { name: /confirmar pago/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Hubo un error al procesar la reserva.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Integracion del Componente", () => {
    it("debe renderizar todos los componentes hijos", async () => {
      const mockPropiedad = createMockPropiedad();

      render(<Reserva />);

      await waitFor(() => {
        expect(screen.getByTestId("gallery")).toBeInTheDocument();
      });

      expect(screen.getByTestId("comments")).toBeInTheDocument();
    });
  });
});
