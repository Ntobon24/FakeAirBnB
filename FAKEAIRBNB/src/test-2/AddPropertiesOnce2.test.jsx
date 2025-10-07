import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddPropertiesOnce from "../pages/AddPropertiesOnce/AddPropertiesOnce";

const mockAddProperty = vi.fn();

vi.mock("../firebase/firebasfunctions", () => ({
  addProperty: (...args) => mockAddProperty(...args),
}));

describe("AddPropertiesOnce.jsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("AAA: Renderiza el título/mensaje de confirmación", () => {
    render(<AddPropertiesOnce />);

    expect(
      screen.getByText(/Propiedades cargadas a Firestore/i)
    ).toBeInTheDocument();
  });

  it("AAA: Llama addProperty exactamente 5 veces al montarse", async () => {
    mockAddProperty.mockResolvedValueOnce(undefined)
                   .mockResolvedValueOnce(undefined)
                   .mockResolvedValueOnce(undefined)
                   .mockResolvedValueOnce(undefined)
                   .mockResolvedValueOnce(undefined);

    render(<AddPropertiesOnce />);

    await waitFor(() => {
      expect(mockAddProperty).toHaveBeenCalledTimes(5);
    });
  });
});
