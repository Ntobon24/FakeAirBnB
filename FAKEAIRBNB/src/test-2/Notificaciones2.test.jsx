import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let Notificaciones;

//Mock del usuario loggeado
let mockUsuario;
let user;

const makeMockUsuario = (overrides = {}) => ({
  uid: "user-test-123",
  email: "testuser@fake.com",
  ...overrides,
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ usuario: mockUsuario }),
}));

//Mock enrutamiento
const navigateMock = vi.fn();

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});

//Mock firebase
const collectionMock = vi.fn();
const whereMock = vi.fn();
const queryMock = vi.fn();
const getDocsMock = vi.fn();
const deleteDocMock = vi.fn();
const docMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: (...args) => collectionMock(...args),
  where: (...args) => whereMock(...args),
  query: (...args) => queryMock(...args),
  getDocs: (...args) => getDocsMock(...args),
  deleteDoc: (...args) => deleteDocMock(...args),
  doc: (...args) => docMock(...args),
}));

vi.mock("../firebase/firebaseConfig", () => ({ db: { __FAKE__: true } }));

const makeSnap = (docsArray) => ({
  docs: docsArray.map(({ id, data }) => ({ id, data: () => data })),
});

const makeNotif = (over = {}) => ({
  id: "n-1",
  titulo: "Cabaña del Lago",
  ubicacion: "Guatapé",
  propiedadId: "prop-9",
  fechaInicio: "2025-01-10T00:00:00.000Z",
  fechaFin: "2025-01-15T00:00:00.000Z",
  fechaSuscripcion: { toDate: () => new Date("2025-01-05T12:00:00.000Z") },
  ...over,
});

const mockGetDocsOnce = (arr) => {
  getDocsMock.mockResolvedValueOnce(makeSnap(arr));
};

const findCardByTitle = async (title) => {
  const h = await screen.findByText(title);
  return h.closest(".notificacion-card");
};



describe("Componente Notificaciones", () => {

    beforeEach(async () => {
        vi.clearAllMocks();
        mockUsuario = makeMockUsuario(); 
        user = userEvent.setup();
        Notificaciones = (await import("../pages/Notificaciones/Notificaciones")).default;
    })

    it("Sin usuario loggeado: redirige a '/' y no consulta Firestore", async () => {
        // Arrange
        mockUsuario = null;

        //Act
        render(<Notificaciones />);

        // Assert
        //Equivalen a: should().HaveBeenCalledWith() ser llamada con los argumentos
        expect(navigateMock).toHaveBeenCalledWith("/");
        expect(getDocsMock).not.toHaveBeenCalled();
    });

    it("Loading -> resuelto: desaparece el 'Cargando...' y muestra estado vacío", async () => {
        //Arrange    
        // No tiene notificaciones
        mockGetDocsOnce([]); 

        //Act
        render(<Notificaciones />);

        //Assert

        // loading=true
        expect(screen.getByText(/cargando notificaciones/i)).toBeInTheDocument();
        // Equivale a: Should().NotBeInTheDocument()
        await waitFor(() =>{
            expect(screen.queryByText(/cargando notificaciones/i)).not.toBeInTheDocument();
            expect(screen.getByText(/mis notificaciones de disponibilidad/i)).toBeInTheDocument();
            expect(screen.getByText(/no tienes notificaciones activas/i)).toBeInTheDocument();
        });
    });

    it("CTA en estado vacio: 'Explorar Propiedades' navega a '/'", async () => {

        // Arrange
        // No tiene notificaciones
        mockGetDocsOnce([]);


        // Act: interaccion click explorar proiedades -> redirige "/"
        render(<Notificaciones />);
        const btn = await screen.findByRole("button", { name: /explorar propiedades/i });
        await user.click(btn);

        // Assert

         // Equivale a: Should().HaveBeenCalledWith("/")
        expect(navigateMock).toHaveBeenCalledWith("/"); 
            
    });
    
    it("Lista con 1 notificacion: renderiza datos, arma la query por usuario y 'Ver Propiedad' navega a /reserva/:id", async () => {
  
        // Arrange
        // Mock Lista con 1 notificacion
        mockGetDocsOnce([{ id: "n-1", data: makeNotif() }]);

        
        // Act
        render(<Notificaciones />);
        
        // Espera cargue pagina
        await screen.findByText(/mis notificaciones de disponibilidad/i);
        
        const card = await findCardByTitle("Cabaña del Lago");
        const inCard = within(card);

        // Assert

        // equivale a Should().BeVisible()
        expect(inCard.getByText("Cabaña del Lago")).toBeInTheDocument();         
        expect(inCard.getByText(/activa/i)).toBeInTheDocument();          

        // valida Query firestore correcta
        expect(whereMock).toHaveBeenCalledWith("usuarioId", "==", "user-test-123");
        expect(collectionMock).toHaveBeenCalledWith(expect.anything(), "notificaciones_disponibilidad");

    });

    it("Click en 'Ver Propiedad' navega ruta detalles de la propiedad", async () => {

        // Arrange
        // Mock Lista con 1 notificacion
        mockGetDocsOnce([{ id: "n-1", data: makeNotif() }]);
  

        //Act: Interaccion user click ver propiedad de notificacion
        render(<Notificaciones />);
        
        //Espera carga pagina
        await screen.findByText(/mis notificaciones de disponibilidad/i);
        const card = await findCardByTitle("Cabaña del Lago");
        const inCard = within(card);
        const verBtn = inCard.getByRole("button", { name: /ver propiedad/i });
        await user.click(verBtn);
        
        //Assert
        expect(navigateMock).toHaveBeenCalledWith("/reserva/prop-9");

    });

    it("Eliminar notificacion de propiedad : llama deleteDoc y la tarjeta desaparece del DOM", async () => {

        // Arrange
        docMock.mockReturnValueOnce({ __DOC__: true });
        deleteDocMock.mockResolvedValueOnce();

        // Mock 1 notif inicial
        mockGetDocsOnce([{ id: "n-1", data: makeNotif() }]);


        //Act: nteraacion Click boton de eliminar notif de propiedad
        render(<Notificaciones />);

        // Espera carga tarjeta
        const card = await findCardByTitle("Cabaña del Lago");
        const btnEliminar = within(card).getByRole("button", { name: /eliminar/i });
        await user.click(btnEliminar);


        // Assert

        // Equivale a: Should().HaveBeenCalledOnce()
        await waitFor(() => {
            expect(deleteDocMock).toHaveBeenCalledTimes(1);
        });
        expect(screen.queryByText("Cabaña del Lago")).not.toBeInTheDocument();

    });

    it("Error al cargar notificaciones de firebase: muestra mensaje de error", async () => {
        // Arrange
        getDocsMock.mockRejectedValueOnce(new Error("Firebase Error"));

        // Act
        render(<Notificaciones />);
        
        // Assert
        // Equivale a: Should().Contain()
        await waitFor(() => {
            ("Error al cargar las notificaciones")
            expect(screen.getByText("Error al cargar las notificaciones")).toBeInTheDocument();
            expect(screen.queryByText(/cargando notificaciones/i)).not.toBeInTheDocument();
        });
    });




});
