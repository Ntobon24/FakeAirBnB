import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Estructure/Header";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../pages/RegistroInicio/Login", () => ({
  default: () => <div data-testid="mock-login">LoginMock</div>,
}));

const renderSUT = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe("Header.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("Renderiza sólo logo y Login cuando no hay usuario (sin enlaces privados)", () => {
    
    useAuth.mockReturnValue({ usuario: null });

    
    renderSUT();

    
    expect(screen.getByText(/FakeAirbnb/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Favoritos/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Notificaciones/i })).toBeNull();
  });

  it("Renderiza enlaces privados cuando hay usuario", () => {
    
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });

   
    renderSUT();

    
    expect(screen.getByText(/FakeAirbnb/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Favoritos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Notificaciones/i })).toBeInTheDocument();
  });

  it("Los enlaces privados tienen rutas correctas cuando hay usuario", () => {

    useAuth.mockReturnValue({ usuario: { uid: "u1" } });

    renderSUT();
    const favLink = screen.getByRole("link", { name: /Favoritos/i });
    const notifLink = screen.getByRole("link", { name: /Notificaciones/i });

    
    expect(favLink).toHaveAttribute("href", "/favoritos");
    expect(notifLink).toHaveAttribute("href", "/notificaciones");
  });

  it("El logo existe como enlace navegable a la raíz", () => {
    
    useAuth.mockReturnValue({ usuario: null });
    renderSUT();
    const logo = screen.getByText(/FakeAirbnb/i);
    const logoLink = logo.closest("a");

    
    expect(logo).toBeInTheDocument();
    expect(logoLink).not.toBeNull();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("Login se muestra tanto con usuario como sin usuario (siempre visible)", () => {
    
    useAuth.mockReturnValue({ usuario: null });


    const { rerender } = renderSUT();

    expect(screen.getByTestId("mock-login")).toBeInTheDocument();

    useAuth.mockReturnValue({ usuario: { uid: "u1" } });

    
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
  });

  it("No revienta si useAuth devuelve un objeto vacío", () => {
    
    useAuth.mockReturnValue({});

    
    renderSUT();

    
    expect(screen.getByText(/FakeAirbnb/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Favoritos/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Notificaciones/i })).toBeNull();
  });

  it("Cambia condicionalmente los enlaces al cambiar el usuario (rerender)", () => {

    useAuth.mockReturnValue({ usuario: null });

    
    const { rerender } = renderSUT();

    
    expect(screen.queryByRole("link", { name: /Favoritos/i })).toBeNull();

    
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });

    
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    
    expect(screen.getByRole("link", { name: /Favoritos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Notificaciones/i })).toBeInTheDocument();
  });

  it("No duplica enlaces al renderizar con usuario (evita elementos repetidos)", () => {
    
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });

    
    renderSUT();
    const favLinks = screen.getAllByRole("link", { name: /Favoritos/i });
    const notifLinks = screen.getAllByRole("link", { name: /Notificaciones/i });

    
    expect(favLinks.length).toBe(1);
    expect(notifLinks.length).toBe(1);
  });
});
