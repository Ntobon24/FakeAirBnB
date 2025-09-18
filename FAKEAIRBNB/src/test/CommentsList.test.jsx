import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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


import { getDocs } from "firebase/firestore";

console.error = vi.fn();

describe("CommentsList.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Muestra mensaje de carga inicialmente", () => {
    render(<CommentsList propiedadId="prop1" />);
    expect(
      screen.getByText(/Cargando calificaciones de la propiedad/i)
    ).toBeInTheDocument();
  });

  it("Muestra mensaje si no hay calificaciones", async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    render(<CommentsList propiedadId="prop1" />);
    await waitFor(() => {
      expect(
        screen.getByText(/Aun no existen calificaciones para esta propiedad/i)
      ).toBeInTheDocument();
    });
  });

  it("Renderiza CommentCard si hay calificaciones", async () => {
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
  });

  it("Maneja error al obtener calificaciones (catch ejecutado)", async () => {
    getDocs.mockRejectedValueOnce(new Error("Firestore error"));
    render(<CommentsList propiedadId="prop1" />);
    await waitFor(() => {
        expect(
        screen.getByText(/Aun no existen calificaciones para esta propiedad/i)
      ).toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      "Error obteniendo calificaciones de la propiedad:",
      expect.any(Error)
    );
  });

  it("Cambia contenido cuando propiedadId cambia", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "3", data: () => ({ usuarioEmail: "otro@test.com" }) }],
    });

    const { rerender } = render(<CommentsList propiedadId="prop1" />);
    await screen.findByText("otro@test.com");

    getDocs.mockResolvedValueOnce({ docs: [] });
    rerender(<CommentsList propiedadId="prop2" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Aun no existen calificaciones para esta propiedad/i)
      ).toBeInTheDocument();
    });
  });
});
