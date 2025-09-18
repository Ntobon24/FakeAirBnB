import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Estructure/Header";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../pages/RegistroInicio/Login", () => ({
  default: () => <div data-testid="mock-login">LoginMock</div>,
}));

describe("Header.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renderiza logo y Login siempre, sin usuario", () => {
    useAuth.mockReturnValue({ usuario: null });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/FakeAirbnb/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
    expect(screen.queryByText(/Favoritos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Notificaciones/i)).not.toBeInTheDocument();
  });

  it("Renderiza Favoritos y Notificaciones cuando hay usuario", () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/FakeAirbnb/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-login")).toBeInTheDocument();
    expect(screen.getByText(/Favoritos/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificaciones/i)).toBeInTheDocument();
  });
});
