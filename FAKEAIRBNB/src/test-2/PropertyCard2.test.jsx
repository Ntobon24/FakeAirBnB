import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyCard from "../components/PropertyCard/PropertyCard";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockFavoriteButton = vi.fn();
const mockAvailabilityNotification = vi.fn();

vi.mock("../components/FavoriteButton/FavoriteButton", () => {
  return {
    default: ({ propiedad }) => {
      mockFavoriteButton(propiedad);
      return (
        <div data-testid="favorite-button" data-prop-id={propiedad?.id}>
          Favorite Button
        </div>
      );
    },
  };
});

vi.mock(
  "../components/AvailabilityNotification/AvailabilityNotification",
  () => {
    return {
      default: ({ propiedad }) => {
        mockAvailabilityNotification(propiedad);
        return (
          <div
            data-testid="availability-notification"
            data-prop-id={propiedad?.id}
          >
            Availability Notification
          </div>
        );
      },
    };
  }
);

const createMockPropiedad = (overrides = {}) => ({
  id: "prop-1",
  titulo: "Loft Centro",
  ubicacion: "Bogotá, Colombia",
  descripcion: "Acogedor loft en el centro de la ciudad",
  precio: 120000,
  maxPersonas: 2,
  habitaciones: 1,
  banos: 1,
  imagenes: ["image1.jpg", "image2.jpg"],
  FotosPropiedad: ["foto1.jpg", "foto2.jpg"],
  ...overrides,
});

const createPropiedadWithImages = (overrides = {}) =>
  createMockPropiedad({
    imagenes: ["primary.jpg", "secondary.jpg"],
    FotosPropiedad: ["backup1.jpg", "backup2.jpg"],
    ...overrides,
  });

const createPropiedadWithOnlyFotosPropiedad = (overrides = {}) =>
  createMockPropiedad({
    imagenes: [],
    FotosPropiedad: ["foto1.jpg", "foto2.jpg"],
    ...overrides,
  });

const createPropiedadWithoutImages = (overrides = {}) =>
  createMockPropiedad({
    imagenes: [],
    FotosPropiedad: [],
    ...overrides,
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PropertyCard Componente", () => {
  describe("Renderizado del Componente", () => {
    it("debe mostrar caracteristicas de la propiedad correctamente", () => {
      const mockPropiedad = createMockPropiedad({
        maxPersonas: 4,
        habitaciones: 2,
        banos: 2,
      });

      render(<PropertyCard propiedad={mockPropiedad} />);

      expect(screen.getByText(/4 personas/i)).toBeInTheDocument();
      expect(screen.getByText(/2 habitaciones/i)).toBeInTheDocument();
      expect(screen.getByText(/2 baños/i)).toBeInTheDocument();
    });

    it("debe renderizar componentes hijos con props correctas", () => {
      const mockPropiedad = createMockPropiedad();

      render(<PropertyCard propiedad={mockPropiedad} />);

      expect(mockFavoriteButton).toHaveBeenCalledWith(mockPropiedad);
      expect(mockAvailabilityNotification).toHaveBeenCalledWith(mockPropiedad);

      expect(screen.getByTestId("favorite-button")).toHaveAttribute(
        "data-prop-id",
        "prop-1"
      );
      expect(screen.getByTestId("availability-notification")).toHaveAttribute(
        "data-prop-id",
        "prop-1"
      );
    });
  });

  describe("Manejo de Imagenes", () => {
    it("debe usar primera imagen del array imagenes cuando esta disponible", () => {
      const mockPropiedad = createPropiedadWithImages();

      render(<PropertyCard propiedad={mockPropiedad} />);

      const image = screen.getByRole("img", { name: /loft centro/i });
      expect(image).toHaveAttribute("src", "primary.jpg");
      expect(image).toHaveAttribute("alt", "Loft Centro");
    });

    it("debe usar FotosPropiedad como respaldo cuando imagenes esta vacio", () => {
      const mockPropiedad = createPropiedadWithOnlyFotosPropiedad();

      render(<PropertyCard propiedad={mockPropiedad} />);

      const image = screen.getByRole("img", { name: /loft centro/i });
      expect(image).toHaveAttribute("src", "foto1.jpg");
    });

    it("debe usar placeholder cuando no hay imagenes disponibles", () => {
      const mockPropiedad = createPropiedadWithoutImages();

      render(<PropertyCard propiedad={mockPropiedad} />);

      const image = screen.getByRole("img", { name: /loft centro/i });
      expect(image).toHaveAttribute(
        "src",
        "https://via.placeholder.com/300x200?text=Sin+Imagen"
      );
    });

    it("debe manejar error de carga de imagen y usar placeholder como respaldo", () => {
      const mockPropiedad = createMockPropiedad({
        imagenes: ["broken-image.jpg"],
      });

      render(<PropertyCard propiedad={mockPropiedad} />);
      const image = screen.getByRole("img", { name: /loft centro/i });

      fireEvent.error(image);

      expect(image).toHaveAttribute(
        "src",
        "https://via.placeholder.com/300x200?text=Sin+Imagen"
      );
    });

    it("debe priorizar imagenes sobre FotosPropiedad", () => {
      const mockPropiedad = createMockPropiedad({
        imagenes: ["priority.jpg"],
        FotosPropiedad: ["fallback.jpg"],
      });

      render(<PropertyCard propiedad={mockPropiedad} />);

      const image = screen.getByRole("img", { name: /loft centro/i });
      expect(image).toHaveAttribute("src", "priority.jpg");
    });
  });

  describe("Funcionalidad de Navegacion", () => {
    it("debe navegar a pagina de reserva cuando se hace click en Ver Detalles", () => {
      const mockPropiedad = createMockPropiedad({ id: "prop-123" });

      render(<PropertyCard propiedad={mockPropiedad} />);
      const detailsButton = screen.getByRole("button", {
        name: /ver detalles/i,
      });
      fireEvent.click(detailsButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/reserva/prop-123");
    });

    it("debe navegar con ID de propiedad correcto", () => {
      const mockPropiedad = createMockPropiedad({ id: "unique-prop-456" });

      render(<PropertyCard propiedad={mockPropiedad} />);
      const detailsButton = screen.getByRole("button", {
        name: /ver detalles/i,
      });
      fireEvent.click(detailsButton);

      expect(mockNavigate).toHaveBeenCalledWith("/reserva/unique-prop-456");
    });
  });

  describe("Mostrar Datos", () => {
    it("debe mostrar ubicacion con formato apropiado", () => {
      const mockPropiedad = createMockPropiedad({
        ubicacion: "Medellín, Antioquia",
      });

      render(<PropertyCard propiedad={mockPropiedad} />);

      expect(screen.getByText(/medellín, antioquia/i)).toBeInTheDocument();
    });

    it("debe manejar descripciones largas de manera elegante", () => {
      const longDescription =
        "Esta es una descripción muy larga que debería ser manejada correctamente por el componente sin causar problemas de layout o renderizado en la interfaz de usuario";
      const mockPropiedad = createMockPropiedad({
        descripcion: longDescription,
      });

      render(<PropertyCard propiedad={mockPropiedad} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe("Integracion del Componente", () => {
    it("debe pasar objeto de propiedad completo a componentes hijos", () => {
      const completePropiedad = createMockPropiedad({
        id: "complete-1",
        titulo: "Casa Completa",
        ubicacion: "Cartagena, Colombia",
        descripcion: "Hermosa casa colonial",
        precio: 300000,
        maxPersonas: 8,
        habitaciones: 4,
        banos: 3,
      });

      render(<PropertyCard propiedad={completePropiedad} />);

      expect(mockFavoriteButton).toHaveBeenCalledWith(completePropiedad);
      expect(mockAvailabilityNotification).toHaveBeenCalledWith(
        completePropiedad
      );
    });
  });

  describe("Rendimiento", () => {
    it("debe manejar multiples re-renders eficientemente", () => {
      const mockPropiedad = createMockPropiedad();
      const { rerender } = render(<PropertyCard propiedad={mockPropiedad} />);

      for (let i = 0; i < 10; i++) {
        rerender(<PropertyCard propiedad={mockPropiedad} />);
      }

      expect(mockFavoriteButton).toHaveBeenCalledTimes(11);
      expect(mockAvailabilityNotification).toHaveBeenCalledTimes(11);
    });
  });
});
