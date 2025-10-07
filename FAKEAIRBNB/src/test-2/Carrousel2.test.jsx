import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Carrousel from "../components/Gallery/Carrousel";

const getItem = (alt) =>
  screen.getByAltText(alt).closest(".carousel-item");

describe("Carrousel.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("AAA: Renderiza imágenes y muestra la primera como activa (solo una activa)", () => {
    const fotos = ["img1.jpg", "img2.jpg"];

    render(<Carrousel FotosPropiedad={fotos} idPropiedad="prop1" />);

    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);

    const first = getItem("Imagen 1");
    const second = getItem("Imagen 2");
    expect(first).toHaveClass("active");
    expect(second).not.toHaveClass("active");
  });

  it("AAA: Avanza a la siguiente imagen con el botón Next", async () => {
    const fotos = ["img1.jpg", "img2.jpg", "img3.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p2" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const nextBtn = buttons[1];

    await userEvent.click(nextBtn);

    const active = getItem("Imagen 2");
    expect(active).toHaveClass("active");
  });

  it("AAA: Retrocede a la anterior con el botón Prev (con wrap desde la 1 a la última)", async () => {
    const fotos = ["a.jpg", "b.jpg", "c.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p3" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const prevBtn = buttons[0];

    await userEvent.click(prevBtn);

    const active = getItem("Imagen 3");
    expect(active).toHaveClass("active");
  });

  it("AAA: Navegación múltiple mantiene una sola 'active' a la vez", async () => {
    const fotos = ["img1.jpg", "img2.jpg", "img3.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p4" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const nextBtn = buttons[1];

    await userEvent.click(nextBtn); 
    await userEvent.click(nextBtn); 

    const active3 = getItem("Imagen 3");
    expect(active3).toHaveClass("active");

    const items = [getItem("Imagen 1"), getItem("Imagen 2"), getItem("Imagen 3")];
    const activeCount = items.filter((el) => el?.classList.contains("active")).length;
    expect(activeCount).toBe(1);
  });

  it("AAA: Avanzar más allá de la última vuelve a la primera (wrap al inicio)", async () => {
    const fotos = ["f1.jpg", "f2.jpg", "f3.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p5" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const nextBtn = buttons[1];

    await userEvent.click(nextBtn); 
    await userEvent.click(nextBtn); 
    await userEvent.click(nextBtn); 

    const active1 = getItem("Imagen 1");
    expect(active1).toHaveClass("active");
  });

  it("AAA: Con una sola imagen, los controles no cambian el activo", async () => {
    const fotos = ["solo.jpg"];
    render(<Carrousel FotosPropiedad={fotos} idPropiedad="p6" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    const [prevBtn, nextBtn] = buttons;

    await userEvent.click(prevBtn);
    await userEvent.click(nextBtn);

    const unico = getItem("Imagen 1");
    expect(unico).toHaveClass("active");
  });
});