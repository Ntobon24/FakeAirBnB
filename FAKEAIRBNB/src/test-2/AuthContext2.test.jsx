import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
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
      <button>Logout</button>
      <button onClick={logout} aria-label="logout-action" style={{ display: "none" }} />
    </div>
  );
};

describe("AuthContext.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("AAA: Actualiza usuario con onAuthStateChanged", () => {
    let callback;
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      callback = cb;
      return unsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    act(() => {
      callback({ email: "test@ejemplo.com" });
    });

    expect(screen.getByTestId("usuario")).toHaveTextContent("test@ejemplo.com");
    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it("AAA: Logout llama a signOut", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ email: "otro@ejemplo.com" });
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await userEvent.click(screen.getByLabelText("logout-action"));

    await act(async () => {
      await Promise.resolve(); 
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("AAA: Logout maneja error en signOut sin romper la UI", async () => {
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

    await userEvent.click(screen.getByLabelText("logout-action"));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("usuario")).toBeInTheDocument();
  });

  it("AAA: se llama al unsubscribe de onAuthStateChanged al desmontar", () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return unsubscribe;
    });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
