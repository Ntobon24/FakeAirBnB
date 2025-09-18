import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AddPropertiesOnce from "../pages/AddPropertiesOnce/AddPropertiesOnce";

const mockAddProperty = vi.fn();
vi.mock("../firebase/firebasfunctions", () => ({
  addProperty: (...args) => mockAddProperty(...args),
}));

describe("AddPropertiesOnce.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título y mensaje", () => {
    render(<AddPropertiesOnce />);
    expect(
      screen.getByText(/Propiedades cargadas a Firestore/i)
    ).toBeInTheDocument();
  });

  it("llama addProperty 5 veces", () => {
    render(<AddPropertiesOnce />);
    expect(mockAddProperty).toHaveBeenCalledTimes(5);
  });
});
