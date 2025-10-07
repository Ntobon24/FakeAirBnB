import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AvailabilityNotification from "../components/AvailabilityNotification/AvailabilityNotification";
import { useAuth } from "../context/AuthContext";
import { addDoc, getDocs, deleteDoc, collection, query, where, doc } from "firebase/firestore";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),  
    collection: vi.fn(() => ({ __col__: "notificaciones" })),
    query: vi.fn((...args) => ({ __query__: args })),
    where: vi.fn((...args) => ({ __where__: args })),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn((...args) => ({ __doc__: args })),
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

  afterEach(() => {
    cleanup();
  });

  it("AAA: Si no hay usuario, muestra botón y alerta al hacer clic", async () => {
    useAuth.mockReturnValue({ usuario: null });
    render(<AvailabilityNotification propiedad={propiedadMock} />);

    await userEvent.click(screen.getByText(/Notificar Disponibilidad/i));

    expect(window.alert).toHaveBeenCalledWith(
      "Debes iniciar sesión para suscribirte a notificaciones"
    );
  });

  it("AAA: Usuario autenticado abre y cierra el date picker", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    render(<AvailabilityNotification propiedad={propiedadMock} />);

    await userEvent.click(screen.getByText(/Notificar Disponibilidad/i));

    expect(
      screen.getByText(/¿Cuándo te interesa esta propiedad\?/i)
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("Cancelar"));

    expect(
      screen.queryByText(/¿Cuándo te interesa esta propiedad\?/i)
    ).not.toBeInTheDocument();
  });

  it("AAA: Muestra error si fecha inicio >= fecha fin", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    render(<AvailabilityNotification propiedad={propiedadMock} />);

    await userEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    await userEvent.clear(screen.getByLabelText(/Fecha de llegada/i));
    await userEvent.type(screen.getByLabelText(/Fecha de llegada/i), "2025-09-20");
    await userEvent.clear(screen.getByLabelText(/Fecha de salida/i));
    await userEvent.type(screen.getByLabelText(/Fecha de salida/i), "2025-09-18");

    await userEvent.click(screen.getByText("Suscribirse"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "La fecha de inicio debe ser anterior a la fecha de fin"
      );
    });
  });

  it("AAA: Suscripción exitosa llama addDoc y alerta de éxito", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
    addDoc.mockResolvedValueOnce({ id: "new-sub" });
    render(<AvailabilityNotification propiedad={propiedadMock} />);

    await userEvent.click(screen.getByText(/Notificar Disponibilidad/i));
    await userEvent.clear(screen.getByLabelText(/Fecha de llegada/i));
    await userEvent.type(screen.getByLabelText(/Fecha de llegada/i), "2025-09-17");
    await userEvent.clear(screen.getByLabelText(/Fecha de salida/i));
    await userEvent.type(screen.getByLabelText(/Fecha de salida/i), "2025-09-19");

    await userEvent.click(screen.getByText("Suscribirse"));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith(
        "Te has suscrito exitosamente a las notificaciones de disponibilidad"
      );
    });
  });

  it("AAA: Maneja error al suscribirse mostrando mensaje de error", async () => {
        useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
        addDoc.mockRejectedValueOnce(new Error("Firestore error"));
        render(<AvailabilityNotification propiedad={propiedadMock} />);

        await userEvent.click(screen.getByText(/Notificar Disponibilidad/i));
        await userEvent.type(screen.getByLabelText(/Fecha de llegada/i), "2025-09-17");
        await userEvent.type(screen.getByLabelText(/Fecha de salida/i), "2025-09-19");

        await userEvent.click(screen.getByText("Suscribirse"));

        await waitFor(() => {
        expect(screen.getByText("Error al suscribirse")).toBeInTheDocument();
        });
    });

    it("AAA: Cancela el formulario de suscripción sin inscribirse", async () => {

        useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" } });
        getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

        render(<AvailabilityNotification propiedad={propiedadMock} />);

        const notifyBtn = await screen.findByRole("button", {
            name: /Notificar Disponibilidad/i,
        });

        expect(notifyBtn).toBeInTheDocument();
        await userEvent.click(notifyBtn);

        expect(
            screen.getByText(/¿Cuándo te interesa esta propiedad?/i)
        ).toBeInTheDocument();

        const cancelarFormularioBtn = screen.getByRole("button", {
            name: /Cancelar/i,
        });
        await userEvent.click(cancelarFormularioBtn);

        await waitFor(() => {
            expect(
            screen.queryByText(/¿Cuándo te interesa esta propiedad?/i)
            ).not.toBeInTheDocument();
        });
    });

    it("AAA Permite desuscribirse eliminando la notificacion si estaba suscrito", async () => {

        const user = userEvent.setup();
        useAuth.mockReturnValue({
            usuario: { uid: "u1", email: "u@test.com" },
        });

        getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [
            {
                id: "sub-123",
                ref: { path: "/notificaciones_disponibilidad/sub-123" },
                data: () => ({
                activa: true,
                fechaInicio: "2025-10-15",
                fechaFin: "2025-10-20",
                propiedadId: "prop-1",
                titulo: "Casa de prueba",
                usuarioId: "u1",
                })}],
            });
        
        //Busca subscripcion para elmininar
        getDocs.mockResolvedValueOnce({
            empty: false,
            docs: [{
            id: "sub-123",
            ref: { path: "/notificaciones_disponibilidad/sub-123" },
            }],
        });

        deleteDoc.mockResolvedValueOnce();

        //Act
        render(<AvailabilityNotification propiedad={propiedadMock} />);

        // Esperar a que se verifique la suscripcion
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Cancelar Notificación/i })).toBeInTheDocument();
        });
        const unsubscribeButton = screen.getByRole("button", { name: /Cancelar Notificación/i });
        await user.click(unsubscribeButton);

        //Assert
        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalledTimes(1);
            expect(deleteDoc).toHaveBeenCalledWith({ 
            __doc__: expect.anything() 
            });
        });

        expect(window.alert).toHaveBeenCalledWith("Te has desuscrito de las notificaciones");
        
    });

    it("AAA No debe permitir suscribirse si no hay usuario autenticado", async () => {

        useAuth.mockReturnValue({ usuario: null });
        render(<AvailabilityNotification propiedad={propiedadMock} />);

        
        const notificarBtn = screen.getByRole("button", {
            name: /Notificar Disponibilidad/i,
        });
        await userEvent.click(notificarBtn);

        
        expect(window.alert).toHaveBeenCalledWith(
            "Debes iniciar sesión para suscribirte a notificaciones"
        );
        expect(addDoc).not.toHaveBeenCalled();
    });

    it("AAA Debe deshabilitar el boton de 'Suscribirse' si no se han seleccionado ambas fechas", async () => {

        useAuth.mockReturnValue({ usuario: { uid: "u1", email: "u@test.com" }});
        render(<AvailabilityNotification propiedad={propiedadMock} />);

        // Abrir el date picker
        const notificarBtn = screen.getByRole("button", {
            name: /Notificar Disponibilidad/i,
        });
        await userEvent.click(notificarBtn);


        const suscribirseBtn = screen.getByRole("button", {
            name: /Suscribirse/i,
        });

        // El boton debe estar deshabilitado
        expect(suscribirseBtn).toBeDisabled();

        
        const inputLlegada = screen.getByLabelText(/Fecha de llegada/i);
        await userEvent.type(inputLlegada, "2025-10-10");
        const inputSalida = screen.getByLabelText(/Fecha de salida/i);
        await userEvent.type(inputSalida, "2025-10-12");

        // Ahora el boton deberia estar habilitado
        expect(suscribirseBtn).toBeEnabled();
    });



});