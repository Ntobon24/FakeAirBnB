import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServiceRating from "../components/ServiceRating/ServiceRating";

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
}));

vi.mock("../../firebase/firebaseConfig", () => ({
  db: { __FAKE__: true },
}));

const createMockReserva = (overrides = {}) => ({
  id: "res-1",
  usuarioId: "user-1",
  propiedadId: "prop-1",
  usuarioEmail: "demo@fake.com",
  ...overrides,
});

const createMockDocSnapshot = (overrides = {}) => ({
  id: "prop-1",
  exists: () => true,
  data: () => ({
    titulo: "Casa de Prueba",
    FotosPropiedad: ["https://img.test/uno.jpg"],
    ...overrides,
  }),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDoc.mockResolvedValue(createMockDocSnapshot());
});

describe("ServiceRating Componente", () => {
  describe("Inicializacion del Componente", () => {
    it("debe mostrar estado de carga inicial y luego renderizar informacion de la propiedad", async () => {
      const mockReserva = createMockReserva();
      const mockOnClose = vi.fn();
      const mockOnConfirm = vi.fn();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByText(/cargando informacion de la propiedad/i)
      ).toBeInTheDocument();

      const title = await screen.findByText("Casa de Prueba");
      expect(title).toBeInTheDocument();

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "https://img.test/uno.jpg");
    });
  });

  describe("Interaccion con Calificacion de Estrellas", () => {
    it("debe actualizar puntaje y mostrar descripcion correcta cuando se selecciona una estrella", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      await screen.findByText("Casa de Prueba");
      const starButtons = screen.getAllByRole("button", { name: "★" });
      await user.click(starButtons[2]);

      expect(screen.getByText(/regular/i)).toBeInTheDocument();
    });

    it("debe mostrar todas las descripciones de calificacion de estrellas correctamente", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();
      const ratingDescriptions = {
        1: "Muy mala",
        2: "Mala",
        3: "Regular",
        4: "Buena",
        5: "Excelente",
      };

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      await screen.findByText("Casa de Prueba");

      for (let rating = 1; rating <= 5; rating++) {
        const starButtons = screen.getAllByRole("button", { name: "★" });
        await user.click(starButtons[rating - 1]);

        expect(
          screen.getByText(ratingDescriptions[rating])
        ).toBeInTheDocument();
      }
    });
  });

  describe("Validacion del Formulario", () => {
    it("debe mostrar error al intentar enviar sin seleccionar puntaje", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      await screen.findByText("Casa de Prueba");
      const submitButton = screen.getByRole("button", {
        name: /enviar calificacion/i,
      });
      await user.click(submitButton);

      expect(
        screen.getByText(/selecciona un puntaje de estrellas válido/i)
      ).toBeInTheDocument();
    });

    it("debe mostrar error cuando el comentario es muy corto", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      await screen.findByText("Casa de Prueba");

      const starButtons = screen.getAllByRole("button", { name: "★" });
      await user.click(starButtons[4]);

      const textarea = screen.getByPlaceholderText(/agrega un comentario/i);
      await user.type(textarea, "Hi");

      const submitButton = screen.getByRole("button", {
        name: /enviar calificacion/i,
      });
      await user.click(submitButton);

      expect(
        screen.getByText(/el comentario debe tener almenor 5 caracteres/i)
      ).toBeInTheDocument();
    });
  });

  describe("Acciones del Usuario", () => {
    it("debe llamar onClose cuando se hace click en el boton cancelar", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();
      const mockOnClose = vi.fn();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={mockOnClose}
          onConfirm={vi.fn()}
        />
      );

      await screen.findByText("Casa de Prueba");
      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("debe llamar onConfirm con payload correcto cuando el formulario es valido", async () => {
      const user = userEvent.setup();
      const mockReserva = createMockReserva();
      const mockOnConfirm = vi.fn();

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={mockOnConfirm}
        />
      );

      await screen.findByText("Casa de Prueba");

      const starButtons = screen.getAllByRole("button", { name: "★" });
      await user.click(starButtons[4]);

      const textarea = screen.getByPlaceholderText(/agrega un comentario/i);
      await user.type(textarea, "Excelente lugar!");

      const submitButton = screen.getByRole("button", {
        name: /enviar calificacion/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });

      const payload = mockOnConfirm.mock.calls[0][0];
      expect(payload).toMatchObject({
        reservaId: mockReserva.id,
        usuarioId: mockReserva.usuarioId,
        propiedadId: mockReserva.propiedadId,
        usuarioEmail: mockReserva.usuarioEmail,
        puntaje: 5,
        comentario: "Excelente lugar!",
      });

      expect(typeof payload.fechaPublicacion).toBe("string");
    });
  });

  describe("Manejo de Errores", () => {
    it("debe manejar errores de Firebase de manera elegante", async () => {
      const mockReserva = createMockReserva();
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockGetDoc.mockRejectedValue(new Error("Firebase error"));

      render(
        <ServiceRating
          reserva={mockReserva}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error obteniendo la propiedad:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("debe manejar prop reserva faltante", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ServiceRating reserva={null} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error obteniendo la reserva del historial de reservas"
      );

      consoleSpy.mockRestore();
    });
  });
});
