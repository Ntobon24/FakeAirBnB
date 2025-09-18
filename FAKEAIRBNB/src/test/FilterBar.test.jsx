import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBar from "../components/FilterBar/FilterBar";

describe("FilterBar.jsx", () => {
  let onFilterChangeMock;
  let initialFilters;

  beforeEach(() => {
    onFilterChangeMock = vi.fn();
    initialFilters = {
      guests: 2,
      rooms: 1,
      bathrooms: 1,
      maxPrice: 500000,
      pets: false,
      pool: false,
      wifi: false,
    };
  });

  it("Renderiza con valores iniciales", () => {
    render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={initialFilters} />
    );
    expect(screen.getByLabelText("Huéspedes").value).toBe("2");
    expect(screen.getByLabelText("Habitaciones").value).toBe("1");
    expect(screen.getByLabelText("Baños").value).toBe("1");
    expect(screen.getByLabelText("Precio máximo").value).toBe("500000");
  });

  it("Cambia valores de inputs numéricos", () => {
    render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={initialFilters} />
    );
    fireEvent.change(screen.getByLabelText("Huéspedes"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Habitaciones"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Baños"), {
      target: { value: "2" },
    });
    expect(screen.getByLabelText("Huéspedes").value).toBe("5");
    expect(screen.getByLabelText("Habitaciones").value).toBe("3");
    expect(screen.getByLabelText("Baños").value).toBe("2");
  });

  it("Alterna los botones de Mascotas, Piscina y WiFi", () => {
    render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={initialFilters} />
    );
    const btnPets = screen.getByRole("button", { name: /Mascotas/i });
    const btnPool = screen.getByRole("button", { name: /Piscina/i });
    const btnWifi = screen.getByRole("button", { name: /WiFi/i });

    fireEvent.click(btnPets);
    expect(btnPets).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(btnPool);
    expect(btnPool).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(btnWifi);
    expect(btnWifi).toHaveAttribute("aria-pressed", "true");
  });

  it("Llama onFilterChange con filtros actualizados al presionar Filtrar", () => {
    render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={initialFilters} />
    );
    fireEvent.change(screen.getByLabelText("Huéspedes"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText(/Filtrar/i));
    expect(onFilterChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({ guests: 4 })
    );
  });

  it("Actualiza estado cuando cambian las props filterData", () => {
    const { rerender } = render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={initialFilters} />
    );
    expect(screen.getByLabelText("Huéspedes").value).toBe("2");

    rerender(
      <FilterBar
        onFilterChange={onFilterChangeMock}
        filterData={{ ...initialFilters, guests: 10 }}
      />
    );
    expect(screen.getByLabelText("Huéspedes").value).toBe("10");
  });
});
