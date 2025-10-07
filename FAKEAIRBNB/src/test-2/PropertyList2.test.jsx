import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PropertyList from "../components/PropertyList/PropertyList";

const mockPropertyCard = vi.fn();
vi.mock("../components/PropertyCard/PropertyCard", () => {
  return {
    default: ({ propiedad }) => {
      mockPropertyCard(propiedad);
      return (
        <div
          data-testid="property-card"
          data-prop-id={propiedad?.id}
          data-prop-title={propiedad?.titulo}
          data-prop-location={propiedad?.ubicacion}
          data-prop-price={propiedad?.precio}
        >
          {propiedad?.titulo ?? "Sin título"}
        </div>
      );
    },
  };
});

const createMockPropiedad = (overrides = {}) => ({
  id: "prop-1",
  titulo: "Loft Centro",
  ubicacion: "Bogotá, Colombia",
  descripcion: "Acogedor loft en el centro",
  precio: 120000,
  maxPersonas: 2,
  habitaciones: 1,
  banos: 1,
  imagenes: ["image1.jpg", "image2.jpg"],
  FotosPropiedad: ["foto1.jpg"],
  ...overrides,
});

const createMockPropiedadesList = (count = 3) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPropiedad({
      id: `prop-${index + 1}`,
      titulo: `Propiedad ${index + 1}`,
      ubicacion: `Ciudad ${index + 1}`,
      precio: 100000 + index * 50000,
    })
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PropertyList Componente", () => {
  describe("Renderizado del Componente", () => {
    it("debe renderizar contenedor con clase CSS correcta", () => {
      const mockPropiedades = createMockPropiedadesList(2);

      const { container } = render(
        <PropertyList propiedades={mockPropiedades} />
      );

      const wrapper = container.querySelector(".property-list");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("property-list");
    });

    it("debe renderizar todas las propiedades en la lista", () => {
      const mockPropiedades = createMockPropiedadesList(5);

      render(<PropertyList propiedades={mockPropiedades} />);

      const propertyCards = screen.getAllByTestId("property-card");
      expect(propertyCards).toHaveLength(5);
    });

    it("debe manejar lista de propiedades vacia de manera elegante", () => {
      const emptyPropiedades = [];

      render(<PropertyList propiedades={emptyPropiedades} />);

      const propertyCards = screen.queryAllByTestId("property-card");
      expect(propertyCards).toHaveLength(0);
    });

    it("debe renderizar propiedad unica correctamente", () => {
      const singlePropiedad = [createMockPropiedad()];

      render(<PropertyList propiedades={singlePropiedad} />);

      const propertyCards = screen.getAllByTestId("property-card");
      expect(propertyCards).toHaveLength(1);
    });
  });

  describe("Paso de Datos de Propiedad", () => {
    it("debe pasar datos de propiedad correctos a cada PropertyCard", () => {
      const mockPropiedades = createMockPropiedadesList(3);

      render(<PropertyList propiedades={mockPropiedades} />);

      expect(mockPropertyCard).toHaveBeenCalledTimes(3);

      mockPropertyCard.mock.calls.forEach((call, index) => {
        const [propiedad] = call;
        expect(propiedad).toMatchObject({
          id: `prop-${index + 1}`,
          titulo: `Propiedad ${index + 1}`,
          ubicacion: `Ciudad ${index + 1}`,
          precio: 100000 + index * 50000,
        });
      });
    });

    it("debe pasar objeto de propiedad completo a PropertyCard", () => {
      const completePropiedad = createMockPropiedad({
        id: "complete-prop",
        titulo: "Casa Completa",
        ubicacion: "Medellín, Colombia",
        descripcion: "Hermosa casa con todas las comodidades",
        precio: 250000,
        maxPersonas: 6,
        habitaciones: 3,
        banos: 2,
        imagenes: ["casa1.jpg", "casa2.jpg"],
        FotosPropiedad: ["foto1.jpg", "foto2.jpg"],
      });

      render(<PropertyList propiedades={[completePropiedad]} />);

      expect(mockPropertyCard).toHaveBeenCalledWith(completePropiedad);
    });

    it("debe mantener orden de propiedades en la lista", () => {
      const mockPropiedades = [
        createMockPropiedad({ id: "prop-a", titulo: "Propiedad A" }),
        createMockPropiedad({ id: "prop-b", titulo: "Propiedad B" }),
        createMockPropiedad({ id: "prop-c", titulo: "Propiedad C" }),
      ];

      render(<PropertyList propiedades={mockPropiedades} />);

      const propertyCards = screen.getAllByTestId("property-card");
      expect(propertyCards[0]).toHaveAttribute(
        "data-prop-title",
        "Propiedad A"
      );
      expect(propertyCards[1]).toHaveAttribute(
        "data-prop-title",
        "Propiedad B"
      );
      expect(propertyCards[2]).toHaveAttribute(
        "data-prop-title",
        "Propiedad C"
      );
    });
  });

  describe("Integracion del Componente", () => {
    it("debe renderizar componentes PropertyCard con props correctas", () => {
      const mockPropiedades = createMockPropiedadesList(2);

      render(<PropertyList propiedades={mockPropiedades} />);

      const propertyCards = screen.getAllByTestId("property-card");

      propertyCards.forEach((card, index) => {
        expect(card).toHaveAttribute("data-prop-id", `prop-${index + 1}`);
        expect(card).toHaveAttribute(
          "data-prop-title",
          `Propiedad ${index + 1}`
        );
        expect(card).toHaveAttribute(
          "data-prop-location",
          `Ciudad ${index + 1}`
        );
        expect(card).toHaveAttribute(
          "data-prop-price",
          (100000 + index * 50000).toString()
        );
      });
    });

    it("debe manejar propiedades con campos opcionales faltantes", () => {
      const minimalPropiedades = [
        createMockPropiedad({
          id: "minimal-1",
          titulo: "Propiedad Mínima",
          ubicacion: undefined,
          precio: undefined,
        }),
      ];

      render(<PropertyList propiedades={minimalPropiedades} />);

      expect(mockPropertyCard).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "minimal-1",
          titulo: "Propiedad Mínima",
        })
      );
    });

    it("debe manejar propiedades con valores null", () => {
      const nullPropiedades = [
        createMockPropiedad({
          id: "null-prop",
          titulo: "Propiedad con Nulos",
          ubicacion: null,
          descripcion: null,
          precio: null,
        }),
      ];

      render(<PropertyList propiedades={nullPropiedades} />);

      expect(mockPropertyCard).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "null-prop",
          titulo: "Propiedad con Nulos",
          ubicacion: null,
          descripcion: null,
          precio: null,
        })
      );
    });
  });

  describe("Rendimiento y Optimizacion", () => {
    it("debe manejar listas grandes de propiedades eficientemente", () => {
      const largePropiedadesList = createMockPropiedadesList(100);

      const startTime = performance.now();
      render(<PropertyList propiedades={largePropiedadesList} />);
      const endTime = performance.now();

      const propertyCards = screen.getAllByTestId("property-card");
      expect(propertyCards).toHaveLength(100);

      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });

    it("debe manejar cambios rapidos en lista de propiedades", () => {
      const initialPropiedades = createMockPropiedadesList(3);
      const { rerender } = render(
        <PropertyList propiedades={initialPropiedades} />
      );

      const updatedPropiedades = createMockPropiedadesList(5);
      rerender(<PropertyList propiedades={updatedPropiedades} />);

      const finalPropiedades = createMockPropiedadesList(2);
      rerender(<PropertyList propiedades={finalPropiedades} />);

      const propertyCards = screen.getAllByTestId("property-card");
      expect(propertyCards).toHaveLength(2);
    });
  });

  describe("Accesibilidad y Estructura", () => {
    it("debe mantener estructura DOM apropiada", () => {
      const mockPropiedades = createMockPropiedadesList(3);

      const { container } = render(
        <PropertyList propiedades={mockPropiedades} />
      );

      const propertyList = container.querySelector(".property-list");
      expect(propertyList).toBeInTheDocument();

      const propertyCards =
        within(propertyList).getAllByTestId("property-card");
      expect(propertyCards).toHaveLength(3);
    });

    it("debe preservar integridad de datos de propiedad", () => {
      const originalPropiedades = createMockPropiedadesList(2);
      const originalData = JSON.parse(JSON.stringify(originalPropiedades));

      render(<PropertyList propiedades={originalPropiedades} />);

      expect(originalPropiedades).toEqual(originalData);
    });
  });
});
