import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Galeria from "../components/Gallery/Gallery";

const renderSUT = (fotos = []) => render(<Galeria FotosPropiedad={fotos} />);

describe("Galeria.jsx", () => {
  it("Muestra mensaje cuando no hay fotos ([])", () => {
    renderSUT([]);
    expect(screen.getByText(/Fotos no disponibles/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("img").length).toBe(0);
  });

  it("Muestra mensaje cuando FotosPropiedad es undefined", () => {
    render(<Galeria />);
    expect(screen.getByText(/Fotos no disponibles/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("img").length).toBe(0);
  });

  it("Renderiza imágenes en el mismo orden recibido", () => {
    const fotos = ["a1.jpg", "b2.jpg", "c3.jpg"];
    renderSUT(fotos);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs.length).toBe(3);
    expect(imgs[0]).toHaveAttribute("src", "a1.jpg");
    expect(imgs[1]).toHaveAttribute("src", "b2.jpg");
    expect(imgs[2]).toHaveAttribute("src", "c3.jpg");
  });

  it("Preserva duplicados si vienen repetidos en props", () => {
    const fotos = ["dup.jpg", "dup.jpg"];
    renderSUT(fotos);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "dup.jpg");
    expect(imgs[1]).toHaveAttribute("src", "dup.jpg");
  });

  it("Cada imagen tiene un alt no vacío (accesibilidad)", () => {
    const fotos = ["1.jpg", "2.jpg", "3.jpg"];
    renderSUT(fotos);
    const imgs = screen.getAllByRole("img");
    imgs.forEach((img) => {
      expect(img.getAttribute("alt")).toBeTruthy();
    });
  });

  it("Renderiza imagen con src original (no maneja errores actualmente)", () => {
    const fotos = ["rota.jpg"];
    renderSUT(fotos);
    const img = screen.getByRole("img");
    
    
    expect(img).toHaveAttribute("src", "rota.jpg");
    
    
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "rota.jpg");
  });

  it("Soporta rutas absolutas y relativas", () => {
    const fotos = [
      "/assets/relativa.png",
      "https://cdn.example.com/fotos/absoluta.png",
    ];
    renderSUT(fotos);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs[0]).toHaveAttribute("src", "/assets/relativa.png");
    expect(imgs[1]).toHaveAttribute("src", "https://cdn.example.com/fotos/absoluta.png");
  });

  it("Renderiza un gran número de imágenes sin colapsar", () => {
    const fotos = Array.from({ length: 100 }, (_, i) => `img_${i}.jpg`);
    renderSUT(fotos);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs).toHaveLength(100);
    expect(imgs[0]).toHaveAttribute("src", "img_0.jpg");
    expect(imgs[99]).toHaveAttribute("src", "img_99.jpg");
  });

  it("No mezcla estado entre ejecuciones (independencia): rerender con diferentes props", () => {
    const { rerender } = render(<Galeria FotosPropiedad={["x.jpg"]} />);
    expect(screen.getAllByAltText("Imagen de la propiedad")[0]).toHaveAttribute("src", "x.jpg");
    rerender(<Galeria FotosPropiedad={["y.jpg", "z.jpg"]} />);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute("src", "y.jpg");
    expect(imgs[1]).toHaveAttribute("src", "z.jpg");
  });

  it("Renderiza todas las entradas del arreglo incluyendo valores no válidos", () => {
    const fotos = ["ok.jpg", "", "otra.jpg"];
    renderSUT(fotos);
    const imgs = screen.getAllByAltText("Imagen de la propiedad");
    
    
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute("src", "ok.jpg");
    
    
    expect(imgs[1]).toBeInTheDocument();
    const srcValue = imgs[1].getAttribute("src");
    expect(srcValue === null || srcValue === "").toBe(true);
    
    expect(imgs[2]).toHaveAttribute("src", "otra.jpg");
  });
});
