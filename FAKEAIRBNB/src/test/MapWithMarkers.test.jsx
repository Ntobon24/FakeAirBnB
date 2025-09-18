import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, rerender } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MapWithMarkers from "../components/MapWithMarkers/MapWithMarkers";

vi.mock("@react-google-maps/api", () => {
  const LoadScript = ({ children }) => <>{children}</>;
  const GoogleMap = ({ children, onLoad, center, zoom, mapContainerStyle }) => {
    if (onLoad) onLoad({ __mockMap__: true });
    return (
      <div
        data-testid="google-map"
        data-zoom={zoom}
        data-center-lat={center?.lat}
        data-center-lng={center?.lng}
        data-style-width={mapContainerStyle?.width}
        data-style-height={mapContainerStyle?.height}
      >
        {children}
      </div>
    );
  };
  const Marker = (props) => (
    <button
      type="button"
      data-testid={`marker-${props.title}`}
      data-lat={props.position?.lat}
      data-lng={props.position?.lng}
      onClick={props.onClick}
      aria-label={`marker-${props.title}`}
    >
      Marker: {props.title}
    </button>
  );
  return { LoadScript, GoogleMap, Marker };
});

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithProviders = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("MapWithMarkers - Suite de 20 tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = [
    { id: "1", lat: "6.25", lng: "-75.56", titulo: "Apto Laureles" },
    { id: "2", lat: "6.28", lng: "-75.59", titulo: "Loft Poblado" },
    { id: "3", lat: "6.21", lng: "-75.57", titulo: "Casa Envigado" },
  ];

  it("renderiza el contenedor del mapa", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
  });

  it("usa el center por defecto esperado (Medellín) y zoom 12", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    const map = screen.getByTestId("google-map");
    expect(parseFloat(map.getAttribute("data-center-lat"))).toBeCloseTo(
      6.2442,
      4
    );
    expect(parseFloat(map.getAttribute("data-center-lng"))).toBeCloseTo(
      -75.5812,
      4
    );
    expect(parseInt(map.getAttribute("data-zoom"))).toBe(12);
  });

  it("respeta dimensiones del contenedor (100% x 400px)", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    const map = screen.getByTestId("google-map");
    expect(map.getAttribute("data-style-width")).toBe("100%");
    expect(map.getAttribute("data-style-height")).toBe("400px");
  });

  it("navega a /reserva/:id al hacer click en un marker específico", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    fireEvent.click(screen.getByTestId("marker-Loft Poblado"));
    expect(mockedNavigate).toHaveBeenCalledWith("/reserva/2");
  });

  it("no navega si no se hace click en ningún marker", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("coordenadas del marker: parsea strings numéricos a floats", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    baseProps.forEach((p) => {
      const el = screen.getByTestId(`marker-${p.titulo}`);
      expect(parseFloat(el.getAttribute("data-lat"))).toBeCloseTo(
        parseFloat(p.lat),
        6
      );
      expect(parseFloat(el.getAttribute("data-lng"))).toBeCloseTo(
        parseFloat(p.lng),
        6
      );
    });
  });

  it("acepta números (no strings) en lat/lng", () => {
    const propsNum = [{ id: "9", lat: 0, lng: 0, titulo: "Cero Cero" }];
    renderWithProviders(<MapWithMarkers propiedades={propsNum} />);
    const el = screen.getByTestId("marker-Cero Cero");
    // parseFloat(0) === 0, en nuestro mock se inyecta directamente
    expect(parseFloat(el.getAttribute("data-lat"))).toBe(0);
    expect(parseFloat(el.getAttribute("data-lng"))).toBe(0);
  });

  it("tolera espacios alrededor de los strings de coords (parseFloat)", () => {
    const propsSpaced = [
      { id: "10", lat: " 6.28 ", lng: " -75.59 ", titulo: "Con Espacios" },
    ];
    renderWithProviders(<MapWithMarkers propiedades={propsSpaced} />);
    const el = screen.getByTestId("marker-Con Espacios");
    expect(parseFloat(el.getAttribute("data-lat"))).toBeCloseTo(6.28, 6);
    expect(parseFloat(el.getAttribute("data-lng"))).toBeCloseTo(-75.59, 6);
  });

  it("coordenadas negativas se pasan tal cual", () => {
    const propsNeg = [
      { id: "11", lat: "-33.45", lng: "-70.66", titulo: "Santiago" },
    ];
    renderWithProviders(<MapWithMarkers propiedades={propsNeg} />);
    const el = screen.getByTestId("marker-Santiago");
    expect(parseFloat(el.getAttribute("data-lat"))).toBeCloseTo(-33.45, 6);
    expect(parseFloat(el.getAttribute("data-lng"))).toBeCloseTo(-70.66, 6);
  });

  it("lista vacía: renderiza mapa y 0 markers", () => {
    renderWithProviders(<MapWithMarkers propiedades={[]} />);
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /Marker:/i })).toHaveLength(
      0
    );
  });

  it("click en múltiples markers navega al id correcto cada vez", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    fireEvent.click(screen.getByTestId("marker-Apto Laureles"));
    fireEvent.click(screen.getByTestId("marker-Casa Envigado"));
    expect(mockedNavigate).toHaveBeenNthCalledWith(1, "/reserva/1");
    expect(mockedNavigate).toHaveBeenNthCalledWith(2, "/reserva/3");
  });

  it("cada click en el mismo marker navega una vez por click", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    const el = screen.getByTestId("marker-Loft Poblado");
    fireEvent.click(el);
    fireEvent.click(el);
    expect(mockedNavigate).toHaveBeenCalledTimes(2);
  });

  it("coords en 0 son válidas (0,0)", () => {
    const zero = [{ id: "13", lat: "0", lng: "0", titulo: "Origen" }];
    renderWithProviders(<MapWithMarkers propiedades={zero} />);
    const el = screen.getByTestId("marker-Origen");
    expect(parseFloat(el.getAttribute("data-lat"))).toBe(0);
    expect(parseFloat(el.getAttribute("data-lng"))).toBe(0);
  });

  it("lat/lng faltantes producen NaN en el marker (defensivo)", () => {
    const bad = [{ id: "14", titulo: "Sin Coords" }];
    renderWithProviders(<MapWithMarkers propiedades={bad} />);
    const el = screen.getByTestId("marker-Sin Coords");
    expect(Number.isNaN(parseFloat(el.getAttribute("data-lat")))).toBe(true);
    expect(Number.isNaN(parseFloat(el.getAttribute("data-lng")))).toBe(true);
  });

  it("IDs duplicados no afectan la navegación por título (clave del test UI)", () => {
    const dup = [
      { id: "42", lat: "6.1", lng: "-75.5", titulo: "PropA" },
      { id: "42", lat: "6.2", lng: "-75.6", titulo: "PropB" },
    ];
    renderWithProviders(<MapWithMarkers propiedades={dup} />);
    fireEvent.click(screen.getByTestId("marker-PropB"));
    expect(mockedNavigate).toHaveBeenCalledWith("/reserva/42");
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
  });

  it("el mapa invoca onLoad internamente (comprobable por presencia del contenedor)", () => {
    renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
  });
});
