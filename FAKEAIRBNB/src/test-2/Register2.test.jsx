import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/RegistroInicio/Register";

const mockCreateUserWithEmailAndPassword = vi.fn();
const mockGetAuth = vi.fn(() => ({}));
const mockLogout = vi.fn();

vi.mock("../firebase/firebaseConfig", () => ({
  __esModule: true,
  default: {},
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: null,
    logout: mockLogout,
  }),
}));

const createMockOnClose = () => vi.fn();

const createMockUser = (overrides = {}) => ({
  email: "test@example.com",
  uid: "user123",
  ...overrides,
});

const createMockAuthError = (code, message) => ({
  code,
  message,
  name: "FirebaseError",
});

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateUserWithEmailAndPassword.mockClear();
});

const renderWithProviders = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const fillRegistrationForm = (
  email = "test@example.com",
  password = "password123"
) => {
  const emailInput = screen.getByPlaceholderText(/ingresar email/i);
  const passwordInput = screen.getByPlaceholderText(/ingresar contraseña/i);

  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });

  return { emailInput, passwordInput };
};

describe("Register Componente", () => {
  describe("Renderizado del Componente", () => {
    it("debe renderizar todos los elementos del formulario correctamente", () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);

      expect(
        screen.getByPlaceholderText(/ingresar email/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/ingresar contraseña/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /registrate/i })
      ).toBeInTheDocument();
    });

    it("debe tener estructura de formulario y accesibilidad apropiadas", () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);

      const emailInput = screen.getByPlaceholderText(/ingresar email/i);
      const passwordInput = screen.getByPlaceholderText(/ingresar contraseña/i);
      const submitButton = screen.getByRole("button", { name: /registrate/i });

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Validacion del Formulario", () => {
    it("debe mostrar error cuando el campo email esta vacio", async () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);
      const submitButton = screen.getByRole("button", { name: /registrate/i });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText("Por favor completa todos los campos")
      ).toBeInTheDocument();
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("debe mostrar error cuando el campo password esta vacio", async () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);

      const emailInput = screen.getByPlaceholderText(/ingresar email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const submitButton = screen.getByRole("button", { name: /registrate/i });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText("Por favor completa todos los campos")
      ).toBeInTheDocument();
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("debe mostrar error cuando ambos campos estan vacios", async () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);
      const submitButton = screen.getByRole("button", { name: /registrate/i });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText("Por favor completa todos los campos")
      ).toBeInTheDocument();
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Interaccion del Usuario", () => {
    it("debe actualizar valor del input email cuando el usuario escribe", () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText(/ingresar email/i);
      fireEvent.change(emailInput, { target: { value: "new@test.com" } });

      expect(emailInput.value).toBe("new@test.com");
    });

    it("debe actualizar valor del input password cuando el usuario escribe", () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);
      const passwordInput = screen.getByPlaceholderText(/ingresar contraseña/i);
      fireEvent.change(passwordInput, { target: { value: "newpassword" } });

      expect(passwordInput.value).toBe("newpassword");
    });
  });

  describe("Manejo de Estado del Formulario", () => {
    it("debe mantener estado del formulario durante interaccion del usuario", () => {
      const mockOnClose = createMockOnClose();

      renderWithProviders(<Register onClose={mockOnClose} />);

      const emailInput = screen.getByPlaceholderText(/ingresar email/i);
      const passwordInput = screen.getByPlaceholderText(/ingresar contraseña/i);

      fireEvent.change(emailInput, { target: { value: "user@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(emailInput.value).toBe("user@test.com");
      expect(passwordInput.value).toBe("password123");
    });

    it("debe resetear estado del formulario despues de envio exitoso", async () => {
      const mockOnClose = createMockOnClose();
      const mockUser = createMockUser();
      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser,
      });

      renderWithProviders(<Register onClose={mockOnClose} />);
      fillRegistrationForm("test@example.com", "password123");

      const submitButton = screen.getByRole("button", { name: /registrate/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });
});
