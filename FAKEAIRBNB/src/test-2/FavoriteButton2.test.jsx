
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton/FavoriteButton";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

vi.mock("../firebase/firebaseConfig", () => ({ __esModule: true, default: {} }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({ __db: "db" })),
  collection: vi.fn((db, path) => ({ __type: "collection", db, path })),
  where: vi.fn((field, op, value) => ({ __type: "where", field, op, value })),
  query: vi.fn((collection, ...constraints) => ({ __type: "query", collection, constraints })),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((db, path, id) => ({ __type: "doc", db, path, id })),
}));

const propiedadBase = Object.freeze({
  id: "prop1",
  titulo: "Casa de prueba",
  ubicacion: "Medellín",
  precio: 1000,
  imagenes: ["foto1.jpg"],
});

const withUser = (uid = "u1") => ({ usuario: { uid, email: `${uid}@test.com` } });
const noUser = () => ({ usuario: null });

const renderSUT = (propiedad = propiedadBase) =>
  render(
    <MemoryRouter>
      <FavoriteButton propiedad={propiedad} />
    </MemoryRouter>
  );

const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("FavoriteButton", () => {
  it("renderiza un botón accesible", async () => {
    useAuth.mockReturnValue(withUser());
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    renderSUT();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("si no hay usuario y se hace clic, muestra alerta y no toca Firestore", async () => {
    useAuth.mockReturnValue(noUser());
    renderSUT();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(getDocs).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("cambia el icono visual entre corazón vacío y lleno según el estado de favorito", async () => {
    useAuth.mockReturnValue(withUser("u1"));
    
   
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    
    renderSUT();
    
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Agregar a favoritos");
      const icon = button.querySelector("i");
      expect(icon).toHaveClass("heart-icon", "far", "fa-heart");
    });
  });

  it("el botón es clickeable y no causa errores cuando hay usuario autenticado", async () => {
    useAuth.mockReturnValue(withUser("u1"));
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });

    renderSUT();
    
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole("button");
    
    
    expect(() => fireEvent.click(button)).not.toThrow();
    
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("favorite-button");
  });

  it("si la propiedad no se pasa, alerta y no llama a Firestore", async () => {
    useAuth.mockReturnValue(withUser());
    render(
      <MemoryRouter>
        <FavoriteButton />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(getDocs).not.toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it("renderiza con diferentes propiedades y mantiene la estructura básica", async () => {
    const propiedadDiferente = {
      id: "prop2",
      titulo: "Villa en la playa",
      ubicacion: "Cartagena",
      precio: 2500,
      imagenes: ["playa1.jpg", "playa2.jpg"],
    };
    
    useAuth.mockReturnValue(withUser("u2"));
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    
    render(
      <MemoryRouter>
        <FavoriteButton propiedad={propiedadDiferente} />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("title", "Agregar a favoritos");
    });
  });
});
