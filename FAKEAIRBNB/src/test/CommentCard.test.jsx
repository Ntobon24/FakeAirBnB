import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentCard from "../components/CommentCard/CommentCard";

const baseCalificacion = {
  usuarioEmail: "user@test.com",
  puntaje: 4,
  fechaPublicacion: "2025-09-17T00:00:00.000Z",
  comentario: "Excelente propiedad",
};

describe("CommentCard.jsx", () => {
  it("Renderiza email del usuario", () => {
    render(<CommentCard calificacion={baseCalificacion} />);
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
  });

  it("Renderiza comentario", () => {
    render(<CommentCard calificacion={baseCalificacion} />);
    expect(screen.getByText("Excelente propiedad")).toBeInTheDocument();
  });

  it("Renderiza estrellas según puntaje", () => {
    render(<CommentCard calificacion={baseCalificacion} />);
    const estrellas = screen.getAllByText("★");
    expect(estrellas).toHaveLength(5);
    const seleccionadas = estrellas.filter((e) =>
      e.className.includes("seleccionada-card")
    );
    expect(seleccionadas).toHaveLength(4);
  });

  it("Renderiza fecha convertida al formato es-ES", () => {
    render(<CommentCard calificacion={baseCalificacion} />);
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("Renderiza correctamente cuando el puntaje es 0", () => {
    const calificacion = { ...baseCalificacion, puntaje: 0 };
    render(<CommentCard calificacion={calificacion} />);
    const estrellas = screen.getAllByText("★");
    const seleccionadas = estrellas.filter((e) =>
      e.className.includes("seleccionada-card")
    );
    expect(seleccionadas).toHaveLength(0);
  });
});
