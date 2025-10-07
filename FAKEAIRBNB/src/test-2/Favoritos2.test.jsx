import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import Favoritos from "../pages/Favoritos/Favoritos";
import { useAuth } from "../context/AuthContext";
import { getDocs, deleteDoc, doc, getFirestore, collection, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("react-router-dom", () => ({ useNavigate: vi.fn() }));
vi.mock("firebase/firestore", () => ({
  __esModule: true,
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}));

const navSpy = vi.fn();

const user = (overrides = {}) => ({ usuario: { uid: "u1", email: "t@t.com", ...overrides } });
const noUser = () => ({ usuario: null });

const docsPayload = (arr) => ({ docs: arr });
const favDoc = (id, overrides = {}) => ({
  id,
  data: () => ({
    propiedadId: id.replace("fav", "prop"),
    titulo: `Casa ${id}`,
    ubicacion: "Medellín",
    precio: 100,
    imagen: "img.jpg",
    fechaAgregado: { toDate: () => new Date("2025-09-17") },
    ...overrides,
  }),
});

describe("Favoritos.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    useNavigate.mockReturnValue(navSpy);
    getFirestore.mockReturnValue({});
    collection.mockReturnValue({});
    query.mockReturnValue({});
    where.mockReturnValue({});
    doc.mockReturnValue({});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("Redirige a '/' si no hay usuario", () => {
    useAuth.mockReturnValue(noUser());
    render(<Favoritos />);
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("Muestra 'Cargando favoritos...' mientras la promesa no resuelve", () => {
    useAuth.mockReturnValue(user());
    getDocs.mockImplementation(() => new Promise(() => {}));
    render(<Favoritos />);
    expect(screen.getByText(/Cargando favoritos/i)).toBeInTheDocument();
  });

  it("Oculta 'Cargando' y muestra mensaje de vacío cuando no hay favoritos", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(docsPayload([]));
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.queryByText(/Cargando favoritos/i)).not.toBeInTheDocument();
      expect(screen.getByText(/No tienes favoritos aún/i)).toBeInTheDocument();
    });
  });

  it("Maneja error al obtener favoritos mostrando mensaje de error", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockRejectedValueOnce(new Error("Firestore error"));
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Error obteniendo favoritos")).toBeInTheDocument();
    });
  });

  it("Renderiza múltiples favoritos cuando existen", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(
      docsPayload([favDoc("fav1"), favDoc("fav2")])
    );
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Casa fav1")).toBeInTheDocument();
      expect(screen.getByText("Casa fav2")).toBeInTheDocument();
    });
    const botonesVer = screen.getAllByText("Ver Propiedad");
    expect(botonesVer.length).toBe(2);
  });

  it("Navega a la propiedad al hacer clic en 'Ver Propiedad'", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(docsPayload([favDoc("fav1", { propiedadId: "prop1" })]));
    render(<Favoritos />);
    await waitFor(() => {
      fireEvent.click(screen.getByText("Ver Propiedad"));
    });
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith("/reserva/prop1");
  });

  it("Permite explorar propiedades desde el estado vacío", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(docsPayload([]));
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText(/No tienes favoritos aún/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Explorar Propiedades"));
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("Elimina un favorito exitosamente y lo remueve del DOM", async () => {
    useAuth.mockReturnValue(user());
    getDocs
      .mockResolvedValueOnce(docsPayload([favDoc("fav1")]))
      .mockResolvedValueOnce(docsPayload([]));
    deleteDoc.mockResolvedValueOnce({});
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Casa fav1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle("Eliminar de favoritos"));
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(deleteDoc).toHaveBeenCalledWith(doc(expect.anything(), "favoritos", "fav1"));
    });
    await waitFor(() => {
      expect(screen.queryByText("Casa fav1")).not.toBeInTheDocument();
    });
  });

  it("Loggea error al eliminar favorito y mantiene el elemento", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(docsPayload([favDoc("fav1")]));
    deleteDoc.mockRejectedValueOnce(new Error("Firestore error"));
    render(<Favoritos />);
    await waitFor(() => {
      expect(screen.getByText("Casa fav1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle("Eliminar de favoritos"));
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("Error eliminando favorito:", expect.any(Error));
    });
    expect(screen.getByText("Casa fav1")).toBeInTheDocument();
  });

  it("Usa placeholder si la imagen falla al cargar", async () => {
    useAuth.mockReturnValue(user());
    getDocs.mockResolvedValueOnce(docsPayload([favDoc("fav1", { imagen: "img_invalida.jpg" })]));
    render(<Favoritos />);
    const img = await screen.findByRole("img");
    fireEvent.error(img);
    expect(img.src).toContain("Imagen+No+Disponible");
  });
});
