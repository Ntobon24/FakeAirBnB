import React from "react";
import { render } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import propiedadPropType from "../propTypes/PropiedadProptype";

const Dummy = ({ propiedad }) => null;
Dummy.propTypes = {
  propiedad: propiedadPropType.isRequired,
};

describe("propiedadPropType", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  test("Objeto mínimo válido (solo requeridos: id, titulo) no emite warnings", () => {
    const ok = { id: "p1", titulo: "Loft Centro" };
    render(<Dummy propiedad={ok} />);
    expect(spy).not.toHaveBeenCalled();
  });

  test("Objeto completo válido no emite warnings", () => {
    const ok = {
      id: "p2",
      titulo: "Casa Completa",
      ubicacion: "Ciudad",
      descripcion: "Desc",
      precio: 100,
      maxPersonas: 4,
      habitaciones: 2,
      banos: 1,
      imagenes: ["a.jpg", "b.jpg"],
      FotosPropiedad: ["c.jpg"],
    };
    render(<Dummy propiedad={ok} />);
    expect(spy).not.toHaveBeenCalled();
  });

  test("Arrays de strings válidos (imagenes y FotosPropiedad) no emiten warnings", () => {
    const ok = {
      id: "p4",
      titulo: "Con arrays válidos",
      imagenes: ["a.jpg", "b.png"],
      FotosPropiedad: ["x.webp"],
    };
    render(<Dummy propiedad={ok} />);
    expect(spy).not.toHaveBeenCalled();
  });

  test("Arrays vacíos válidos no emiten warnings", () => {
    const ok = {
      id: "p5",
      titulo: "Con arrays vacíos",
      imagenes: [],
      FotosPropiedad: [],
    };
    render(<Dummy propiedad={ok} />);
    expect(spy).not.toHaveBeenCalled();
  });

  test("Valores nulos en campos opcionales no emiten warnings", () => {
    const ok = {
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
    };
    render(<Dummy propiedad={ok} />);
    expect(spy).not.toHaveBeenCalled();
  });

});
