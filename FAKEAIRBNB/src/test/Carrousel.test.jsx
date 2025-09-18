import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Carrousel from "../components/Gallery/Carrousel";

describe("Carrousel.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza imágenes y muestra la primera como activa", () => {
    const fotos = ["img1.jpg", "img2.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="prop1" />);

    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);

    const active = screen.getByAltText("Imagen 1").parentElement;
    expect(active.className).toContain("active");
  });

  it("Cambia a la siguiente imagen con el botón Next", () => {
    const fotos = ["img1.jpg", "img2.jpg", "img3.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p2" />);

    const nextBtn = screen.getAllByRole("button")[1]; 
    fireEvent.click(nextBtn);

    const active = screen.getByAltText("Imagen 2").parentElement;
    expect(active.className).toContain("active");
  });

  it("Cambia a la imagen anterior con el botón Prev", () => {
    const fotos = ["a.jpg", "b.jpg", "c.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p3" />);

    const prevBtn = screen.getAllByRole("button")[0]; 
    fireEvent.click(prevBtn);

    const active = screen.getByAltText("Imagen 3").parentElement;
    expect(active.className).toContain("active");
  });
});
