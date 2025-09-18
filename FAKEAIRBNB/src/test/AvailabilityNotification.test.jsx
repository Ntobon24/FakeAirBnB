import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AvailabilityNotification from "../components/AvailabilityNotification/AvailabilityNotification";
import { useAuth } from "../context/AuthContext";
import { addDoc, getDocs, deleteDoc } from "firebase/firestore";


vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),  
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
  };
});


window.alert = vi.fn();
console.error = vi.fn();

const propiedadMock = {
  id: "prop-1",
  titulo: "Casa de prueba",
  ubicacion: "Medellín",
};

describe("AvailabilityNotification.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDocs.mockResolvedValue({ empty: true, docs: [] });
  });

  it("Si no hay usuario, muestra botón que alerta al hacer clic", () => {
    useAuth.mockReturnValue({ usuario: null });
    render(<AvailabilityNotification propiedad={propiedadMock} />);
    fireEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    expect(window.alert).toHaveBeenCalledWith(
      "Debes iniciar sesión para suscribirte a notificaciones"
    );
  });

  it("Usuario autenticado, abre y cierra date picker", () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    render(<AvailabilityNotification propiedad={propiedadMock} />);
    fireEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    expect(
      screen.getByText(/¿Cuándo te interesa esta propiedad\?/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(
      screen.queryByText(/¿Cuándo te interesa esta propiedad\?/i)
    ).not.toBeInTheDocument();
  });

  it("Muestra error si fecha inicio >= fecha fin", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    render(<AvailabilityNotification propiedad={propiedadMock} />);
    fireEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    fireEvent.change(screen.getByLabelText(/Fecha de llegada/i), {
      target: { value: "2025-09-20" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha de salida/i), {
      target: { value: "2025-09-18" },
    });
    fireEvent.click(screen.getByText("Suscribirse"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "La fecha de inicio debe ser anterior a la fecha de fin"
      );
    });
  });

  it("Suscripción exitosa llama addDoc y muestra alerta", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    addDoc.mockResolvedValueOnce({});
    render(<AvailabilityNotification propiedad={propiedadMock} />);
    fireEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    fireEvent.change(screen.getByLabelText(/Fecha de llegada/i), {
      target: { value: "2025-09-17" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha de salida/i), {
      target: { value: "2025-09-19" },
    });
    fireEvent.click(screen.getByText("Suscribirse"));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        "Te has suscrito exitosamente a las notificaciones de disponibilidad"
      );
    });
  });

  it("Maneja error al suscribirse mostrando mensaje", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    addDoc.mockRejectedValueOnce(new Error("Firestore error"));
    render(<AvailabilityNotification propiedad={propiedadMock} />);
    fireEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    fireEvent.change(screen.getByLabelText(/Fecha de llegada/i), {
      target: { value: "2025-09-17" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha de salida/i), {
      target: { value: "2025-09-19" },
    });
    fireEvent.click(screen.getByText("Suscribirse"));
    await waitFor(() => {
      expect(
        screen.getByText("Error al suscribirse")
      ).toBeInTheDocument();
    });
  });
});
