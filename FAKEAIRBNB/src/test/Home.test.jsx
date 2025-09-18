import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home/Home";

vi.mock("../components/FilterBar/FilterBar", () => ({
  __esModule: true,
  default: ({ onFilterChange }) => (
    <button data-testid="filterbar" onClick={() => onFilterChange({ guests: 99, rooms: 1, bathrooms: 1, maxPrice: 2000, pets: true, pool: true, wifi: true })}>
      FilterBar
    </button>
  ),
}));
vi.mock("../components/SearchBar/SearchBar", () => ({
  __esModule: true,
  default: ({ onSearch }) => (
    <button data-testid="searchbar" onClick={() => onSearch({ location: "medellin", startDate: new Date("2025-09-01"), endDate: new Date("2025-09-05") })}>
      SearchBar
    </button>
  ),
}));
vi.mock("../components/MapWithMarkers/MapWithMarkers", () => ({
  __esModule: true,
  default: () => <div data-testid="map">Map</div>,
}));
vi.mock("../components/PropertyList/PropertyList", () => ({
  __esModule: true,
  default: ({ propiedades }) => (
    <div data-testid="propertylist">{propiedades.map((p) => p.titulo).join(",")}</div>
  ),
}));

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    getDocs: vi.fn(),
  };
});
import { getDocs } from "firebase/firestore";

console.error = vi.fn();

describe("Home.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Muestra mensaje de carga inicialmente", () => {
    render(<Home />);
    expect(screen.getByText(/Cargando propiedades/i)).toBeInTheDocument();
  });

  it("Muestra mensaje cuando no hay propiedades", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText(/No hay propiedades disponibles/i)).toBeInTheDocument();
    });
  });

  it("Renderiza PropertyList cuando hay propiedades", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "1", data: () => ({ titulo: "Casa 1", maxPersonas: 5, habitaciones: 2, banos: 1, precio: 500, mascotasPermitidas: true, piscina: false, wifi: true, ubicacion: "Medellin" }) }],
    });
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId("propertylist")).toHaveTextContent("Casa 1");
    });
  });

  it("Ejecuta handleFilter desde FilterBar", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "1", data: () => ({ titulo: "Casa 2", maxPersonas: 100, habitaciones: 10, banos: 5, precio: 1000, mascotasPermitidas: true, piscina: true, wifi: true, ubicacion: "Bogota" }) }],
    });
    render(<Home />);
    const filterButton = await screen.findByTestId("filterbar");
    filterButton.click();
    await waitFor(() => {
      expect(screen.getByTestId("propertylist")).toHaveTextContent("Casa 2");
    });
  });

  it("Ejecuta handleSearch desde SearchBar", async () => {
    getDocs
      .mockResolvedValueOnce({
        docs: [{ id: "1", data: () => ({ titulo: "Casa 3", maxPersonas: 3, habitaciones: 1, banos: 1, precio: 800, mascotasPermitidas: false, piscina: false, wifi: false, ubicacion: "Medellin" }) }],
      }) 
      .mockResolvedValueOnce({
        docs: [], 
      });
    render(<Home />);
    const searchButton = await screen.findByTestId("searchbar");
    searchButton.click();
    await waitFor(() => {
      expect(screen.getByTestId("propertylist")).toHaveTextContent("Casa 3");
    });
  });
});
