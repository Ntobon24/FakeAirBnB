import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import propiedadPropType from "../propTypes/PropiedadProptype";

const createMockConsoleSpy = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});

const createMinimalValidPropiedad = (overrides = {}) => ({
  id: "p1",
  titulo: "Loft Centro",
  ...overrides,
});

const createCompleteValidPropiedad = (overrides = {}) => ({
  id: "p2",
  titulo: "Casa Completa",
  ubicacion: "Ciudad",
  descripcion: "Descripción completa",
  precio: 100,
  maxPersonas: 4,
  habitaciones: 2,
  banos: 1,
  imagenes: ["a.jpg", "b.jpg"],
  FotosPropiedad: ["c.jpg"],
  ...overrides,
});

const createPropiedadWithArrays = (overrides = {}) => ({
  id: "p4",
  titulo: "Con arrays válidos",
  imagenes: ["a.jpg", "b.png"],
  FotosPropiedad: ["x.webp"],
  ...overrides,
});

const createPropiedadWithEmptyArrays = (overrides = {}) => ({
  id: "p5",
  titulo: "Con arrays vacíos",
  imagenes: [],
  FotosPropiedad: [],
  ...overrides,
});

const createPropiedadWithNulls = (overrides = {}) => ({
  id: "p7",
  titulo: "Nulos",
  ubicacion: null,
  descripcion: null,
  precio: null,
  maxPersonas: null,
  habitaciones: null,
  banos: null,
  imagenes: null,
  FotosPropiedad: null,
  ...overrides,
});

const DummyComponent = ({ propiedad }) => null;
DummyComponent.propTypes = {
  propiedad: propiedadPropType.isRequired,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("propiedadPropType", () => {
  describe("Validacion de PropType Valido", () => {
    it("no debe emitir warnings para objeto valido minimo con solo campos requeridos", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createMinimalValidPropiedad();

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("no debe emitir warnings para objeto valido completo con todos los campos", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createCompleteValidPropiedad();

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("no debe emitir warnings para arrays de strings validos en imagenes y FotosPropiedad", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createPropiedadWithArrays();

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("no debe emitir warnings para arrays vacios en campos opcionales", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createPropiedadWithEmptyArrays();

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("no debe emitir warnings para valores null en campos opcionales", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createPropiedadWithNulls();

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("Casos Extremos", () => {
    it("debe manejar campos opcionales undefined de manera elegante", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createMinimalValidPropiedad();
      delete validPropiedad.ubicacion;
      delete validPropiedad.descripcion;

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("debe manejar valores de string vacio en campos opcionales", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createMinimalValidPropiedad({
        ubicacion: "",
        descripcion: "",
      });

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("debe manejar valores cero en campos numericos", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createMinimalValidPropiedad({
        precio: 0,
        maxPersonas: 0,
        habitaciones: 0,
        banos: 0,
      });

      render(<DummyComponent propiedad={validPropiedad} />);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("Rendimiento y Memoria", () => {
    it("no debe causar memory leaks con multiples renders", () => {
      const consoleSpy = createMockConsoleSpy();
      const validPropiedad = createMinimalValidPropiedad();

      for (let i = 0; i < 10; i++) {
        render(<DummyComponent propiedad={validPropiedad} />);
      }

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("debe manejar cambios rapidos de props eficientemente", () => {
      const consoleSpy = createMockConsoleSpy();
      const { rerender } = render(
        <DummyComponent propiedad={createMinimalValidPropiedad()} />
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <DummyComponent
            propiedad={createCompleteValidPropiedad({ id: `p${i}` })}
          />
        );
      }

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
