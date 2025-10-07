import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommentsList from "../components/CommentsList/CommentsList";

vi.mock("../components/CommentCard/CommentCard", () => ({
  __esModule: true,
  default: ({ calificacion }) => (
    <div data-testid="mock-comment">{calificacion.usuarioEmail}</div>
  ),
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

import { getDocs, query, where, collection } from "firebase/firestore";

console.error = vi.fn();

describe("CommentsList.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("AAA: Muestra mensaje de carga inicialmente", () => {
    render(<CommentsList propiedadId="prop1" />);

    expect(
      screen.getByText(/Cargando calificaciones de la propiedad/i)
    ).toBeInTheDocument();
  });

  it("AAA: Muestra mensaje si no hay calificaciones", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<CommentsList propiedadId="prop1" />);

    expect(await screen.findByText(/Aun no existen calificaciones/i))
      .toBeInTheDocument();
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("AAA: Renderiza CommentCard si hay calificaciones", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: "1", data: () => ({ usuarioEmail: "user1@test.com" }) },
        { id: "2", data: () => ({ usuarioEmail: "user2@test.com" }) },
      ],
    });

    render(<CommentsList propiedadId="prop1" />);

    const items = await screen.findAllByTestId("mock-comment");
    expect(items).toHaveLength(2);
    expect(screen.getByText("user1@test.com")).toBeInTheDocument();
    expect(screen.getByText("user2@test.com")).toBeInTheDocument();
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("AAA: Maneja error al obtener calificaciones (catch ejecutado)", async () => {
    getDocs.mockRejectedValueOnce(new Error("Firestore error"));

    render(<CommentsList propiedadId="prop1" />);

    expect(
      await screen.findByText(/Aun no existen calificaciones para esta propiedad/i)
    ).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      "Error obteniendo calificaciones de la propiedad:",
      expect.any(Error)
    );
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it("AAA: Carga datos nuevamente si cambia propiedadId", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "3", data: () => ({ usuarioEmail: "otro@test.com" }) }],
    });

    const { rerender } = render(<CommentsList propiedadId="prop1" />);

    expect(await screen.findByText("otro@test.com")).toBeInTheDocument();
    expect(getDocs).toHaveBeenCalledTimes(1);

    getDocs.mockResolvedValueOnce({ docs: [] });

    rerender(<CommentsList propiedadId="prop2" />);

    expect(
      await screen.findByText(/Aun no existen calificaciones para esta propiedad/i)
    ).toBeInTheDocument();
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it("AAA (opcional): El mensaje de carga desaparece al completar la carga", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "1", data: () => ({ usuarioEmail: "x@test.com" }) }],
    });

    render(<CommentsList propiedadId="prop1" />);

    expect(
      screen.getByText(/Cargando calificaciones de la propiedad/i)
    ).toBeInTheDocument();

    await screen.findByText("x@test.com");

    await waitFor(() => {
      expect(
        screen.queryByText(/Cargando calificaciones de la propiedad/i)
      ).not.toBeInTheDocument();
    });
  });

  it("AAA (opcional): Construye la consulta (query/where/collection) con filtros por propiedadId", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });

    render(<CommentsList propiedadId="prop-xyz" />);

    await screen.findByText(/Aun no existen calificaciones/i);
    expect(collection).toHaveBeenCalled();
    expect(query).toHaveBeenCalled();
    expect(where).toHaveBeenCalled(); 
  });
});