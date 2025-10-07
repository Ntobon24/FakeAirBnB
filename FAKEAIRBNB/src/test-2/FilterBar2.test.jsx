import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterBar from "../components/FilterBar/FilterBar";

describe("FilterBar.jsx", () => {
  let onFilterChangeMock;
  let initialFilters;

  beforeEach(() => {
    onFilterChangeMock = vi.fn();
    initialFilters = Object.freeze({
      guests: 2,
      rooms: 1,
      bathrooms: 1,
      maxPrice: 500000,
      pets: false,
      pool: false,
      wifi: false,
    });
  });

  it("Renderiza con valores iniciales", () => {
    
    const filters = { ...initialFilters };

    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={filters} />);

    
    expect(screen.getByLabelText("Huéspedes").value).toBe("2");
    expect(screen.getByLabelText("Habitaciones").value).toBe("1");
    expect(screen.getByLabelText("Baños").value).toBe("1");
    expect(screen.getByLabelText("Precio máximo").value).toBe("500000");
  });

  it("Actualiza inputs numéricos y refleja valores en pantalla", () => {
    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />);

    
    fireEvent.change(screen.getByLabelText("Huéspedes"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Habitaciones"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Baños"), { target: { value: "2" } });

    
    expect(screen.getByLabelText("Huéspedes").value).toBe("5");
    expect(screen.getByLabelText("Habitaciones").value).toBe("3");
    expect(screen.getByLabelText("Baños").value).toBe("2");
  });

  it("Alterna los toggles (Mascotas, Piscina, WiFi) encendido y apagado", () => {
    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />);
    const btnPets = screen.getByRole("button", { name: /Mascotas/i });
    const btnPool = screen.getByRole("button", { name: /Piscina/i });
    const btnWifi = screen.getByRole("button", { name: /WiFi/i });

    
    fireEvent.click(btnPets);
    fireEvent.click(btnPool);
    fireEvent.click(btnWifi);

    
    expect(btnPets).toHaveAttribute("aria-pressed", "true");
    expect(btnPool).toHaveAttribute("aria-pressed", "true");
    expect(btnWifi).toHaveAttribute("aria-pressed", "true");

    
    fireEvent.click(btnPets);
    fireEvent.click(btnPool);
    fireEvent.click(btnWifi);

    
    expect(btnPets).toHaveAttribute("aria-pressed", "false");
    expect(btnPool).toHaveAttribute("aria-pressed", "false");
    expect(btnWifi).toHaveAttribute("aria-pressed", "false");
  });

  it("Llama onFilterChange con filtros combinados tras varios cambios y 'Filtrar'", () => {
    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />);

    
    fireEvent.change(screen.getByLabelText("Huéspedes"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Habitaciones"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Baños"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Precio máximo"), { target: { value: "750000" } });
    fireEvent.click(screen.getByRole("button", { name: /Mascotas/i }));
    fireEvent.click(screen.getByRole("button", { name: /WiFi/i }));
    fireEvent.click(screen.getByText(/Filtrar/i));


    expect(onFilterChangeMock)
      .toHaveBeenCalledTimes(1);
    expect(onFilterChangeMock)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          guests: 4,
          rooms: 2,
          bathrooms: 2,
          pets: true,
          wifi: true,
          pool: false,
          maxPrice: expect.any(Number),
        })
      );
  });

  it("Llama onFilterChange con el estado inicial cuando no se cambian valores", () => {
    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />);

    
    fireEvent.click(screen.getByText(/Filtrar/i));

    
    expect(onFilterChangeMock).toHaveBeenCalledTimes(1);
    expect(onFilterChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        guests: 2,
        rooms: 1,
        bathrooms: 1,
        maxPrice: expect.any(Number),
        pets: false,
        pool: false,
        wifi: false,
      })
    );
  });

  it("Sincroniza controles cuando cambian las props (rerender)", () => {
    
    const { rerender } = render(
      <FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />
    );

    expect(screen.getByLabelText("Huéspedes").value).toBe("2");

    
    rerender(
      <FilterBar
        onFilterChange={onFilterChangeMock}
        filterData={{ ...initialFilters, guests: 10, maxPrice: 900000 }}
      />
    );

    expect(screen.getByLabelText("Huéspedes").value).toBe("10");
    expect(screen.getByLabelText("Precio máximo").value).toBe("900000");
  });

  it("No muta el objeto filterData recibido por props", () => {
    
    const external = { ...initialFilters };
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={external} />);

    
    fireEvent.change(screen.getByLabelText("Huéspedes"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: /Mascotas/i }));
    fireEvent.click(screen.getByText(/Filtrar/i));

   
    expect(external).toEqual({
      guests: 2,
      rooms: 1,
      bathrooms: 1,
      maxPrice: 500000,
      pets: false,
      pool: false,
      wifi: false,
    });
  });

  it("Normaliza valores extremos de 'Precio máximo' y los envía a onFilterChange", () => {
    
    render(<FilterBar onFilterChange={onFilterChangeMock} filterData={{ ...initialFilters }} />);

    
    fireEvent.change(screen.getByLabelText("Precio máximo"), { target: { value: "0" } });
    fireEvent.click(screen.getByText(/Filtrar/i));

    
    expect(onFilterChangeMock).toHaveBeenCalledTimes(1);
    expect(onFilterChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPrice: expect.any(Number),
      })
    );
  });
});
