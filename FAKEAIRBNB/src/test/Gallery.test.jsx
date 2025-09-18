import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Galeria from "../components/Gallery/Gallery"; // ajusta la ruta según tu estructura

describe("Galeria.jsx", () => {
  it("Muestra mensaje cuando no hay fotos", () => {
    render(<Galeria FotosPropiedad={[]} />);
    expect(screen.getByText(/Fotos no disponibles/i)).toBeInTheDocument();
  });

  it("Renderiza imágenes cuando se proveen fotos", () => {
    const fotos = ["foto1.jpg", "foto2.jpg"];
    render(<Galeria FotosPropiedad={fotos} />);

    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "foto1.jpg");
    expect(imgs[1]).toHaveAttribute("src", "foto2.jpg");
  });
});
