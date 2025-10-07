import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

vi.mock("../pages/Home/Home", () => ({
  __esModule: true,
  default: () => <div data-testid="home">Home Page</div>,
}));
vi.mock("../components/PropertyList/PropertyList", () => ({
  __esModule: true,
  default: () => <div data-testid="property-list">Property List</div>,
}));
vi.mock("../pages/Reserva/Reserva", () => ({
  __esModule: true,
  default: () => <div data-testid="reserva">Reserva</div>,
}));
vi.mock("../components/MapWithMarkers/MapWithMarkers", () => ({
  __esModule: true,
  default: () => <div data-testid="map">Map</div>,
}));
vi.mock("../pages/AddPropertiesOnce/AddPropertiesOnce", () => ({
  __esModule: true,
  default: () => <div data-testid="add-properties">Add Properties</div>,
}));
vi.mock("../pages/HistorialReservas/HistorialReservas", () => ({
  __esModule: true,
  default: () => <div data-testid="historial">Historial</div>,
}));
vi.mock("../pages/Favoritos/Favoritos", () => ({
  __esModule: true,
  default: () => <div data-testid="favoritos">Favoritos</div>,
}));
vi.mock("../pages/Notificaciones/Notificaciones", () => ({
  __esModule: true,
  default: () => <div data-testid="notificaciones">Notificaciones</div>,
}));
vi.mock("../components/Estructure/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));
vi.mock("../pages/UpdatePropertyImages/UpdatePropertyImages", () => ({
  __esModule: true,
  default: () => <div data-testid="update-images">Update Images</div>,
}));

const navigateTo = (path) => {
  window.history.pushState({}, "", path);
};

describe("App.jsx routing", () => {
  it("muestra Header en todas las páginas", () => {
    navigateTo("/");
    render(<App />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renderiza Home en '/'", () => {
    navigateTo("/");
    render(<App />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("renderiza PropertyList en '/propiedades'", () => {
    navigateTo("/propiedades");
    render(<App />);
    expect(screen.getByTestId("property-list")).toBeInTheDocument();
  });

  it("renderiza Reserva en '/reserva/123'", () => {
    navigateTo("/reserva/123");
    render(<App />);
    expect(screen.getByTestId("reserva")).toBeInTheDocument();
  });

  it("renderiza MapWithMarkers en '/mapa'", () => {
    navigateTo("/mapa");
    render(<App />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  it("renderiza AddPropertiesOnce en '/add-properties'", () => {
    navigateTo("/add-properties");
    render(<App />);
    expect(screen.getByTestId("add-properties")).toBeInTheDocument();
  });

  it("renderiza HistorialReservas en '/historial-reservas'", () => {
    navigateTo("/historial-reservas");
    render(<App />);
    expect(screen.getByTestId("historial")).toBeInTheDocument();
  });

  it("renderiza Favoritos en '/favoritos'", () => {
    navigateTo("/favoritos");
    render(<App />);
    expect(screen.getByTestId("favoritos")).toBeInTheDocument();
  });

  it("renderiza Notificaciones en '/notificaciones'", () => {
    navigateTo("/notificaciones");
    render(<App />);
    expect(screen.getByTestId("notificaciones")).toBeInTheDocument();
  });

});
