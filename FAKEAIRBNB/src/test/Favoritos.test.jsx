import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Favoritos from "../pages/Favoritos/Favoritos";
import { useAuth } from "../context/AuthContext";
import { getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("firebase/firestore", () => {
  return {
    __esModule: true,
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

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

console.error = vi.fn();

const mockNavigate = vi.fn();

describe("Favoritos.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("Redirige si no hay usuario", () => {
    useAuth.mockReturnValue({ usuario: null });
    render(<Favoritos />);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("Muestra 'Cargando favoritos...' mientras carga", () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockImplementation(
      () => new Promise(() => {}) 
    );
    render(<Favoritos />);
    expect(screen.getByText(/Cargando favoritos/)).toBeInTheDocument();
  });

  it("Maneja error al obtener favoritos", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockRejectedValueOnce(new Error("Firestore error"));
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Error obteniendo favoritos")).toBeInTheDocument();
    });
  });

  it("Muestra mensaje cuando no hay favoritos", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({ docs: [] });
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText(/No tienes favoritos aún/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Explorar Propiedades"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("Renderiza lista de favoritos", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "fav1",
          data: () => ({
            propiedadId: "prop1",
            titulo: "Casa Bonita",
            ubicacion: "Medellín",
            precio: 100,
            imagen: "img.jpg",
            fechaAgregado: { toDate: () => new Date("2025-09-17") },
          }),
        },
      ],
    });
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Casa Bonita")).toBeInTheDocument();
    });
  });

  it("Elimina un favorito correctamente", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "fav1",
          data: () => ({
            propiedadId: "prop1",
            titulo: "Casa Bonita",
            ubicacion: "Medellín",
            precio: 100,
            imagen: "img.jpg",
            fechaAgregado: { toDate: () => new Date() },
          }),
        },
      ],
    });
    deleteDoc.mockResolvedValueOnce({});
    render(<Favoritos />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Eliminar de favoritos"));
    });
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(doc(expect.anything(), "favoritos", "fav1"));
    });
  });

  it("Navega al hacer clic en 'Ver Propiedad'", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "fav1",
          data: () => ({
            propiedadId: "prop1",
            titulo: "Casa Bonita",
            ubicacion: "Medellín",
            precio: 100,
            imagen: "img.jpg",
            fechaAgregado: { toDate: () => new Date() },
          }),
        },
      ],
    });
    render(<Favoritos />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Ver Propiedad"));
    });
    expect(mockNavigate).toHaveBeenCalledWith("/reserva/prop1");
  });

  it("Maneja error al eliminar favorito", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "fav1",
          data: () => ({
            propiedadId: "prop1",
            titulo: "Casa Bonita",
            ubicacion: "Medellín",
            precio: 100,
            imagen: "img.jpg",
            fechaAgregado: { toDate: () => new Date() },
          }),
        },
      ],
    });
    deleteDoc.mockRejectedValueOnce(new Error("Firestore error"));
    render(<Favoritos />);
    await waitFor(() => {
      fireEvent.click(screen.getByTitle("Eliminar de favoritos"));
    });
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error eliminando favorito:",
        expect.any(Error)
      );
    });
  });

  it("Usa placeholder si la imagen falla", async () => {
    useAuth.mockReturnValue({ usuario: { uid: "u1" } });
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "fav1",
          data: () => ({
            propiedadId: "prop1",
            titulo: "Casa Bonita",
            ubicacion: "Medellín",
            precio: 100,
            imagen: "img_invalida.jpg",
            fechaAgregado: { toDate: () => new Date() },
          }),
        },
      ],
    });
    render(<Favoritos />);
    const img = await screen.findByRole("img");
    fireEvent.error(img);
    expect(img.src).toContain("Imagen+No+Disponible");
  });
});
