import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, beforeEach, test, expect, vi } from "vitest";
import PropertyCard from "../components/PropertyCard/PropertyCard";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/FavoriteButton/FavoriteButton", () => {
  return {
    default: ({ propiedad }) => (
      <div data-testid="favorite" data-prop-id={propiedad?.id}>Favorite</div>
    ),
  };
});

vi.mock("../components/AvailabilityNotification/AvailabilityNotification", () => {
  return {
    default: ({ propiedad }) => (
      <div data-testid="availability" data-prop-id={propiedad?.id}>Availability</div>
    ),
  };
});

const BASE_PROP = {
  id: "p1",
  titulo: "Loft Centro",
  ubicacion: "Bogotá, Colombia",
  descripcion: "Acogedor loft en el centro.",
  precio: 120,
  maxPersonas: 2,
  habitaciones: 1,
  banos: 1,
};

const PLACEHOLDER = "https://via.placeholder.com/300x200?text=Sin+Imagen";

describe("PropertyCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renderiza contenido principal", () => {
    render(<PropertyCard propiedad={BASE_PROP} />);
    expect(screen.getByRole("heading", { name: /loft centro/i })).toBeInTheDocument();
    expect(screen.getByText(/bogotá, colombia/i)).toBeInTheDocument();
    expect(screen.getByText(/acogedor loft en el centro\./i)).toBeInTheDocument();
    expect(screen.getByText(/\$120 por noche/i)).toBeInTheDocument();
    expect(screen.getByText(/2 personas/i)).toBeInTheDocument();
    expect(screen.getByText(/1 habitaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/1 baños/i)).toBeInTheDocument();
  });

  test("usa primera imagen de 'imagenes' y alt correcto", () => {
    const prop = { ...BASE_PROP, imagenes: ["img/a.jpg", "img/b.jpg"] };
    render(<PropertyCard propiedad={prop} />);
    const img = screen.getByRole("img", { name: /loft centro/i });
    expect(img).toHaveAttribute("src", "img/a.jpg");
    expect(img).toHaveAttribute("alt", "Loft Centro");
  });

  test("si no hay 'imagenes', usa primera de 'FotosPropiedad'", () => {
    const prop = { ...BASE_PROP, imagenes: [], FotosPropiedad: ["foto/1.webp", "foto/2.webp"] };
    render(<PropertyCard propiedad={prop} />);
    const img = screen.getByRole("img", { name: /loft centro/i });
    expect(img).toHaveAttribute("src", "foto/1.webp");
  });

  test("si no hay imágenes en ninguno, usa placeholder", () => {
    const prop = { ...BASE_PROP, imagenes: [], FotosPropiedad: [] };
    render(<PropertyCard propiedad={prop} />);
    const img = screen.getByRole("img", { name: /loft centro/i });
    expect(img).toHaveAttribute("src", PLACEHOLDER);
  });

  test("onError cambia al placeholder", () => {
    const prop = { ...BASE_PROP, imagenes: ["img/rompe.jpg"] };
    render(<PropertyCard propiedad={prop} />);
    const img = screen.getByRole("img", { name: /loft centro/i });
    expect(img).toHaveAttribute("src", "img/rompe.jpg");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", PLACEHOLDER);
  });

  test("navega al hacer click en Ver Detalles", () => {
    render(<PropertyCard propiedad={BASE_PROP} />);
    const btn = screen.getByRole("button", { name: /ver detalles/i });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/reserva/p1");
  });

  test("pasa propiedad correcta a hijos", () => {
    render(<PropertyCard propiedad={BASE_PROP} />);
    expect(screen.getByTestId("favorite")).toHaveAttribute("data-prop-id", "p1");
    expect(screen.getByTestId("availability")).toHaveAttribute("data-prop-id", "p1");
  });
});
