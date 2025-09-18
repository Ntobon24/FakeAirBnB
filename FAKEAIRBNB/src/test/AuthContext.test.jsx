import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signOut: (...args) => mockSignOut(...args),
}));

vi.mock("../firebase/firebaseConfig", () => ({
  __esModule: true,
  default: {},
}));

const TestComponent = () => {
  const { usuario, logout } = useAuth();
  return (
    <div>
      <p data-testid="usuario">{usuario ? usuario.email : "null"}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Actualiza usuario con onAuthStateChanged", () => {
    let callback;
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      callback = cb;
      return vi.fn(); 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      callback({ email: "test@ejemplo.com" });
    });

    expect(screen.getByTestId("usuario").textContent).toBe("test@ejemplo.com");
  });

  it("Logout llama a signOut", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: "otro@ejemplo.com" });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("Logout maneja error en signOut", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("Fallo al cerrar sesión"));
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: "err@ejemplo.com" });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
});
