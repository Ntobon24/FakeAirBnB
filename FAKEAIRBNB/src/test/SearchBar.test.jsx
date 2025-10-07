// SearchBar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeAll, afterAll } from "vitest";
import SearchBar from "../components/SearchBar/SearchBar";

const FIXED_TODAY = new Date("2025-09-18T12:00:00Z");
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});
afterAll(() => {
  vi.useRealTimers();
});

vi.mock("react-datepicker", () => {
  return {
    default: ({ selected, onChange, minDate, className, id }) => {
      const toYMD = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
      return (
        <input
          id={id}
          role="textbox"
          className={className}
          data-testid={`datepicker-${id}`}
          data-min-date={toYMD(minDate)}
          value={toYMD(selected)}
          onChange={(e) => onChange(new Date(e.target.value))}
          placeholder="Fecha"
        />
      );
    },
  };
});

const setup = (onSearch = vi.fn(), searchData = { location: "", startDate: null, endDate: null, guestsSearch: 1 }) => {
  const utils = render(<SearchBar onSearch={onSearch} searchData={searchData} />);
  const locationInput = screen.getByPlaceholderText("¿A dónde vas?");
  const startInput = screen.getByTestId("datepicker-start-date");
  const endInput = screen.getByTestId("datepicker-end-date");
  const searchBtn = screen.getByRole("button", { name: /buscar/i });
  return { ...utils, locationInput, startInput, endInput, searchBtn, onSearch };
};

describe("SearchBar", () => {
  test("Renderiza ubicación, dos fechas y botón Buscar", () => {
    const { locationInput, startInput, endInput, searchBtn } = setup();
    expect(locationInput).toBeInTheDocument();
    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
    expect(searchBtn).toBeInTheDocument();
  });

  test("Muestra error si se pulsa Buscar sin rango de fechas", async () => {
    const { searchBtn } = setup();
    
    fireEvent.click(searchBtn);
    
    expect(
      screen.getByText("Selecciona un rango de fechas válido.")
    ).toBeInTheDocument();
  });

  test("Llama onSearch con location, startDate y endDate válidos y limpia el error", () => {
    const onSearch = vi.fn();
    const { locationInput, startInput, endInput, searchBtn } = setup(onSearch);

    fireEvent.change(locationInput, { target: { value: "Bogotá" } });
    fireEvent.change(startInput, { target: { value: "2025-09-20" } });
    fireEvent.change(endInput, { target: { value: "2025-09-23" } });

    fireEvent.click(searchBtn);

    expect(onSearch).toHaveBeenCalledTimes(1);
    const payload = onSearch.mock.calls[0][0];
    expect(payload.location).toBe("Bogotá");
    const toYMD = (d) => d.toISOString().slice(0, 10);
    expect(toYMD(payload.startDate)).toBe("2025-09-20");
    expect(toYMD(payload.endDate)).toBe("2025-09-23");

    expect(
      screen.queryByText("Selecciona un rango de fechas válido.")
    ).not.toBeInTheDocument();
  });

  test("El minDate del DatePicker de fin se actualiza al seleccionar la fecha de inicio", () => {
    const { startInput, endInput } = setup();

    expect(endInput.getAttribute("data-min-date")).toBe("");
    
    fireEvent.change(startInput, { target: { value: "2025-09-25" } });

    expect(endInput.getAttribute("data-min-date")).toBe("2025-09-25");
  });

  test("El DatePicker de inicio tiene minDate basado en startDate inicial", () => {
    const searchData = { location: "", startDate: null, endDate: null, guestsSearch: 1 };
    const { startInput } = setup(vi.fn(), searchData);
    expect(startInput.getAttribute("data-min-date")).toBe("");
  });

  test("Muestra error si no hay fechas seleccionadas al hacer búsqueda", () => {
    const onSearch = vi.fn();
    const { searchBtn } = setup(onSearch);
    
    fireEvent.click(searchBtn);
    
    expect(screen.getByText("Selecciona un rango de fechas válido.")).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  test("Limpia el mensaje de error cuando se hace búsqueda válida", () => {
    const onSearch = vi.fn();
    const { locationInput, startInput, endInput, searchBtn } = setup(onSearch);

    fireEvent.click(searchBtn);
    expect(screen.getByText("Selecciona un rango de fechas válido.")).toBeInTheDocument();

    fireEvent.change(locationInput, { target: { value: "Madrid" } });
    fireEvent.change(startInput, { target: { value: "2025-09-20" } });
    fireEvent.change(endInput, { target: { value: "2025-09-25" } });

    fireEvent.click(searchBtn);

    expect(screen.queryByText("Selecciona un rango de fechas válido.")).not.toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
