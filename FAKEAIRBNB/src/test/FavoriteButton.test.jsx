import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FavoriteButton from "../components/FavoriteButton/FavoriteButton";
import { useAuth } from "../context/AuthContext";
import { addDoc, getDocs, deleteDoc } from "firebase/firestore";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => {
  return {
    getFirestore: vi.fn(),   
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
  };
});


window.alert = vi.fn();
console.error = vi.fn();

const propiedadMock = {
  id: "prop1",
  titulo: "Casa de prueba",
  ubicacion: "Medellín",
  precio: 1000,
  imagenes: ["foto1.jpg"],
};

describe("FavoriteButton.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Si no hay usuario, muestra alerta al hacer clic", () => {
    useAuth.mockReturnValue({ usuario: null });
    render(<FavoriteButton propiedad={propiedadMock} />);
    fireEvent.click(screen.getByRole("button"));
    expect(window.alert).toHaveBeenCalledWith(
      "Debes iniciar sesión para guardar favoritos"
    );
  });

  it("Usuario autenticado pero propiedad inválida", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });
    const invalidProp = { ...propiedadMock, id: "" };
    render(<FavoriteButton propiedad={invalidProp} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error: Propiedad no válida");
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("Marca como favorito (addDoc)", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    addDoc.mockResolvedValueOnce({});
    render(<FavoriteButton propiedad={propiedadMock} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
    });
  });

  it("Maneja error en Firestore al agregar", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    addDoc.mockRejectedValueOnce(new Error("Firestore error"));
    render(<FavoriteButton propiedad={propiedadMock} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error al cambiar favorito:",
        expect.any(Error)
      );
    });
  });

  it("Ejecuta checkIfFavorite en useEffect", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1", email: "test@test.com" } });
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    render(<FavoriteButton propiedad={propiedadMock} />);
    await waitFor(() => {
      expect(getDocs).toHaveBeenCalled();
    });
  });
});
