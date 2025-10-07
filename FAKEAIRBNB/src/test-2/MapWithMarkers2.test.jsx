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

const baseProps = [
    { id: "1", lat: "6.25", lng: "-75.56", titulo: "Apto Laureles" },
    { id: "2", lat: "6.28", lng: "-75.59", titulo: "Loft Poblado" },
    { id: "3", lat: "6.21", lng: "-75.57", titulo: "Casa Envigado" },
];

describe("MapWithMarkers - Suite de 20 tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    
    it("renderiza el contenedor del mapa", () => {
        // Arrange
        renderWithProviders(<MapWithMarkers propiedades={baseProps} />);

        // Assert
        const map = screen.getByTestId("google-map");
        expect(map).toBeInTheDocument();
    });

    it("centra el mapa en Medellin por defecto al inicializar", () => {
        //Arrange
        renderWithProviders(<MapWithMarkers propiedades={baseProps} />);
        const map = screen.getByTestId("google-map");

        //Assert
        expect(map.getAttribute("data-center-lat")).toBe("6.2442");
        expect(map.getAttribute("data-center-lng")).toBe("-75.5812");
    });

    it("navega a /reserva/:id al hacer click en un marker específico", () => {
        // Arrange
        renderWithProviders(<MapWithMarkers propiedades={baseProps} />);

        // Act interaccion: click sobre marcador asociad a prop
        fireEvent.click(screen.getByTestId("marker-Loft Poblado"));

        // Assert
        expect(mockedNavigate).toHaveBeenCalledWith("/reserva/2");
    });

    it("no renderiza marcadores si la lista de propiedades está vacia", () => {

        //Arrange
        renderWithProviders(<MapWithMarkers propiedades={[]} />);

        //Assert
        expect(screen.queryByTestId(/marker-/)).not.toBeInTheDocument();
    });

    




    





});