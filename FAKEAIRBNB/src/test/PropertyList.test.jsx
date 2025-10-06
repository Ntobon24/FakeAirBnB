import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import PropertyList from "../components/PropertyList/PropertyList";

vi.mock("../components/PropertyCard/PropertyCard", () => {
  return {
    default: ({ propiedad }) => (
      <div
        data-testid="card"
        data-prop-id={propiedad?.id}
        data-prop-title={propiedad?.title}
      >
        {propiedad?.title ?? "Sin título"}
      </div>
    ),
  };
});

const SAMPLE = [
  { id: "p1", title: "Loft Centro" },
  { id: "p2", title: "Casa Colonial" },
  { id: "p3", title: "Cabaña Montaña" },
];

describe("PropertyList", () => {
  test(" Renderiza contenedor con clase 'property-list' y tres PropertyCard", () => {
    const { container } = render(<PropertyList propiedades={SAMPLE} />);
    const wrapper = container.querySelector(".property-list");
    expect(wrapper).toBeInTheDocument();

    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(3);
  });

  test(" Pasa correctamente la prop 'propiedad' a cada PropertyCard (id y title)", () => {
    render(<PropertyList propiedades={SAMPLE} />);
    const cards = screen.getAllByTestId("card");

    expect(cards[0]).toHaveAttribute("data-prop-id", "p1");
    expect(cards[0]).toHaveAttribute("data-prop-title", "Loft Centro");

    expect(cards[1]).toHaveAttribute("data-prop-id", "p2");
    expect(cards[1]).toHaveAttribute("data-prop-title", "Casa Colonial");

    expect(cards[2]).toHaveAttribute("data-prop-id", "p3");
    expect(cards[2]).toHaveAttribute("data-prop-title", "Cabaña Montaña");
  });

  test(" Mantiene el orden de las propiedades al renderizar", () => {
    render(<PropertyList propiedades={SAMPLE} />);
    const cards = screen.getAllByTestId("card");

    expect(cards.map((c) => c.textContent)).toEqual([
      "Loft Centro",
      "Casa Colonial",
      "Cabaña Montaña",
    ]);

    expect(cards.map((c) => c.getAttribute("data-prop-id"))).toEqual([
      "p1",
      "p2",
      "p3",
    ]);
  });

  test(' No emite warnings de React sobre keys únicas en listas', () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<PropertyList propiedades={SAMPLE} />);
    const calls = spy.mock.calls.flat().join(" ");
    expect(calls).not.toMatch(/each child in a list should have a unique "key" prop/i);
    spy.mockRestore();
  });

  test(" Maneja lista vacía sin romper (0 cards)", () => {
    render(<PropertyList propiedades={[]} />);
    const list = document.querySelector('.property-list');
    expect(list).toBeInTheDocument();
    expect(screen.queryAllByTestId("card")).toHaveLength(0);
  });
});
