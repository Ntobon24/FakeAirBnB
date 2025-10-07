import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../components/SearchBar/SearchBar";

const FIXED_TODAY = new Date("2025-09-18T12:00:00Z");

vi.mock("react-datepicker", () => {
  return {
    default: ({ selected, onChange, minDate, className, id }) => {
      const toYMD = (d) => {
        if (!d) return "";
        try {
          return new Date(d).toISOString().slice(0, 10);
        } catch {
          return "";
        }
      };
      return (
        <input
          id={id}
          role="textbox"
          className={className}
          data-testid={`datepicker-${id}`}
          data-min-date={toYMD(minDate)}
          value={toYMD(selected)}
          onChange={(e) => {
            try {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                onChange(date);
              }
            } catch {}
          }}
          placeholder="Fecha"
        />
      );
    },
  };
});

const createMockSearchData = (overrides = {}) => ({
  location: "",
  startDate: null,
  endDate: null,
  guestsSearch: 1,
  ...overrides,
});

const createMockOnSearch = () => vi.fn();

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
});

const setupSearchBar = (
  onSearch = createMockOnSearch(),
  searchData = createMockSearchData()
) => {
  const utils = render(
    <SearchBar onSearch={onSearch} searchData={searchData} />
  );
  const locationInput = screen.getByPlaceholderText("¿A dónde vas?");
  const startInput = screen.getByTestId("datepicker-start-date");
  const endInput = screen.getByTestId("datepicker-end-date");
  const searchBtn = screen.getByRole("button", { name: /buscar/i });

  return {
    ...utils,
    locationInput,
    startInput,
    endInput,
    searchBtn,
    onSearch,
  };
};

describe("SearchBar Componente", () => {
  describe("Renderizado del Componente", () => {
    it("debe renderizar todos los elementos de formulario requeridos", () => {
      const mockOnSearch = createMockOnSearch();
      const mockSearchData = createMockSearchData();

      const { locationInput, startInput, endInput, searchBtn } = setupSearchBar(
        mockOnSearch,
        mockSearchData
      );

      expect(locationInput).toBeInTheDocument();
      expect(startInput).toBeInTheDocument();
      expect(endInput).toBeInTheDocument();
      expect(searchBtn).toBeInTheDocument();
    });

    it("debe mostrar etiquetas para todos los campos del formulario", () => {
      setupSearchBar();

      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument();
    });
  });

  describe("Validacion del Formulario", () => {
    it("debe mostrar error cuando se intenta buscar sin rango de fechas", () => {
      const { searchBtn } = setupSearchBar();

      fireEvent.click(searchBtn);

      expect(
        screen.getByText("Selecciona un rango de fechas válido.")
      ).toBeInTheDocument();
    });

    it("no debe llamar onSearch cuando la validacion falla", () => {
      const mockOnSearch = createMockOnSearch();
      const { searchBtn } = setupSearchBar(mockOnSearch);

      fireEvent.click(searchBtn);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("debe limpiar mensaje de error cuando se realiza busqueda valida", () => {
      const mockOnSearch = createMockOnSearch();
      const { locationInput, startInput, endInput, searchBtn } =
        setupSearchBar(mockOnSearch);

      fireEvent.click(searchBtn);
      expect(
        screen.getByText("Selecciona un rango de fechas válido.")
      ).toBeInTheDocument();

      fireEvent.change(locationInput, { target: { value: "Madrid" } });
      fireEvent.change(startInput, { target: { value: "2025-09-20" } });
      fireEvent.change(endInput, { target: { value: "2025-09-25" } });
      fireEvent.click(searchBtn);

      expect(
        screen.queryByText("Selecciona un rango de fechas válido.")
      ).not.toBeInTheDocument();
    });
  });

  describe("Funcionalidad de Busqueda", () => {
    it("debe llamar onSearch con datos correctos cuando el formulario es valido", () => {
      const mockOnSearch = createMockOnSearch();
      const { locationInput, startInput, endInput, searchBtn } =
        setupSearchBar(mockOnSearch);

      fireEvent.change(locationInput, { target: { value: "Bogotá" } });
      fireEvent.change(startInput, { target: { value: "2025-09-20" } });
      fireEvent.change(endInput, { target: { value: "2025-09-23" } });
      fireEvent.click(searchBtn);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);

      const payload = mockOnSearch.mock.calls[0][0];
      expect(payload.location).toBe("Bogotá");

      const toYMD = (d) => d.toISOString().slice(0, 10);
      expect(toYMD(payload.startDate)).toBe("2025-09-20");
      expect(toYMD(payload.endDate)).toBe("2025-09-23");
    });

    it("debe manejar cambios en input de ubicacion correctamente", () => {
      const { locationInput } = setupSearchBar();

      fireEvent.change(locationInput, { target: { value: "París" } });

      expect(locationInput.value).toBe("París");
    });
  });

  describe("Integracion con DatePicker", () => {
    it("debe actualizar fecha minima de fin cuando se selecciona fecha de inicio", () => {
      const { startInput, endInput } = setupSearchBar();

      fireEvent.change(startInput, { target: { value: "2025-09-25" } });

      expect(endInput.getAttribute("data-min-date")).toBe("2025-09-25");
    });

    it("debe mantener fecha minima de inicio basada en searchData inicial", () => {
      const searchDataWithStartDate = createMockSearchData({
        startDate: new Date("2025-09-20"),
      });

      const { startInput } = setupSearchBar(
        createMockOnSearch(),
        searchDataWithStartDate
      );

      expect(startInput.getAttribute("data-min-date")).toBe("2025-09-20");
    });

    it("debe manejar cambios de fecha correctamente", () => {
      const { startInput, endInput } = setupSearchBar();

      fireEvent.change(startInput, { target: { value: "2025-09-20" } });
      fireEvent.change(endInput, { target: { value: "2025-09-25" } });

      expect(startInput.value).toBe("2025-09-20");
      expect(endInput.value).toBe("2025-09-25");
    });
  });

  describe("Manejo de Estado", () => {
    it("debe actualizar filtros cuando cambia la prop searchData", () => {
      const initialSearchData = createMockSearchData({
        location: "Initial Location",
      });
      const updatedSearchData = createMockSearchData({
        location: "Updated Location",
      });

      const { rerender } = setupSearchBar(
        createMockOnSearch(),
        initialSearchData
      );
      const locationInput = screen.getByPlaceholderText("¿A dónde vas?");

      expect(locationInput.value).toBe("Initial Location");

      rerender(
        <SearchBar
          onSearch={createMockOnSearch()}
          searchData={updatedSearchData}
        />
      );

      const updatedLocationInput = screen.getByPlaceholderText("¿A dónde vas?");
      expect(updatedLocationInput.value).toBe("Updated Location");
    });

    it("debe mantener estado del formulario durante interaccion del usuario", () => {
      const { locationInput, startInput, endInput } = setupSearchBar();

      fireEvent.change(locationInput, { target: { value: "Tokyo" } });
      fireEvent.change(startInput, { target: { value: "2025-10-01" } });
      fireEvent.change(endInput, { target: { value: "2025-10-05" } });

      expect(locationInput.value).toBe("Tokyo");
      expect(startInput.value).toBe("2025-10-01");
      expect(endInput.value).toBe("2025-10-05");
    });
  });

  describe("Manejo de Errores", () => {
    it("debe manejar inputs de fecha vacios de manera elegante", () => {
      const { startInput, endInput, searchBtn } = setupSearchBar();

      fireEvent.change(startInput, { target: { value: "" } });
      fireEvent.change(endInput, { target: { value: "" } });
      fireEvent.click(searchBtn);

      expect(
        screen.getByText("Selecciona un rango de fechas válido.")
      ).toBeInTheDocument();
    });

    it("debe manejar formatos de fecha invalidos", () => {
      const { startInput, endInput, searchBtn } = setupSearchBar();

      fireEvent.change(startInput, { target: { value: "invalid-date" } });
      fireEvent.change(endInput, { target: { value: "invalid-date" } });
      fireEvent.click(searchBtn);

      expect(
        screen.getByText("Selecciona un rango de fechas válido.")
      ).toBeInTheDocument();
    });
  });

  describe("Accesibilidad", () => {
    it("debe tener estructura de formulario y etiquetas apropiadas", () => {
      setupSearchBar();

      expect(
        screen.getByRole("button", { name: /buscar/i })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("¿A dónde vas?")).toBeInTheDocument();
    });

    it("debe soportar navegacion por teclado", () => {
      const { locationInput, searchBtn } = setupSearchBar();

      expect(locationInput).toHaveAttribute("type", "text");
      expect(searchBtn).toBeInTheDocument();
      expect(searchBtn.tagName).toBe("BUTTON");
    });
  });
});
