import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommentCard from "../components/CommentCard/CommentCard";

const baseCalificacion = {
  usuarioEmail: "user@test.com",
  puntaje: 4,
  fechaPublicacion: "2025-09-17T00:00:00.000Z",
  comentario: "Excelente propiedad",
};

afterEach(() => {
  cleanup();
});

describe("CommentCard.jsx", () => {
  it("AAA: Renderiza email del usuario", () => {
    render(<CommentCard calificacion={baseCalificacion} />);

    expect(screen.getByText("user@test.com")).toBeInTheDocument();
  });

  it("AAA: Renderiza el comentario", () => {
    render(<CommentCard calificacion={baseCalificacion} />);

    expect(screen.getByText("Excelente propiedad")).toBeInTheDocument();
  });

  it("AAA: Renderiza 5 estrellas y marca 'puntaje' como seleccionadas", () => {
    render(<CommentCard calificacion={baseCalificacion} />);

    const estrellas = screen.getAllByText("★");
    expect(estrellas).toHaveLength(5);

    const seleccionadas = estrellas.filter((e) =>
      e.classList.contains("seleccionada-card")
    );
    expect(seleccionadas).toHaveLength(4);
  });
  
});