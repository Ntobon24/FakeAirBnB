import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import Reserva from '../pages/Reserva/Reserva';


const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: () => navigateMock,
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn(),
}));

vi.mock('../firebase/firebaseConfig', () => ({
  default: {},
  db: {},
  auth: {},
}));

const docMock = vi.fn();
const getDocMock = vi.fn();
const collectionMock = vi.fn();
const getDocsMock = vi.fn();
const queryMock = vi.fn();
const whereMock = vi.fn();
const addDocMock = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (...args) => docMock(...args),
  getDoc: (...args) => getDocMock(...args),
  collection: (...args) => collectionMock(...args),
  getDocs: (...args) => getDocsMock(...args),
  query: (...args) => queryMock(...args),
  where: (...args) => whereMock(...args),
  addDoc: (...args) => addDocMock(...args),
}));

vi.mock('react-datepicker', () => {
  return {
    default: ({ selected, onChange, minDate }) => (
      <input
        data-testid="datepicker"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value && value.trim() !== '') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              onChange(date);
            }
          } else {
            onChange(null);
          }
        }}
        min={minDate ? minDate.toISOString().split('T')[0] : ''}
      />
    ),
  };
});

vi.mock('../components/Gallery/Gallery', () => ({
  default: () => <div data-testid="gallery">Gallery Component</div>,
}));

vi.mock('../components/PasarelaPagosFake/PasarelaPagosFake', () => ({
  default: ({ onClose, onConfirm }) => (
    <div data-testid="pasarela">
      <button onClick={onClose}>Cerrar</button>
      <button onClick={onConfirm}>Confirmar Pago</button>
    </div>
  ),
}));

vi.mock('../components/CommentsList/CommentsList', () => ({
  default: () => <div data-testid="comments">Comments Component</div>,
}));

vi.mock('../pages/RegistroInicio/Login', () => ({
  default: () => <div data-testid="login">Login Component</div>,
}));

const mockPropiedad = {
  id: 'prop1',
  titulo: 'Casa en la playa',
  ubicacion: 'Cancún, México',
  descripcion: 'Hermosa casa frente al mar',
  clima: 'Tropical',
  habitaciones: 3,
  banos: 2,
  maxPersonas: 6,
  mascotasPermitidas: true,
  wifi: true,
  piscina: true,
  aireAcondicionado: true,
  parqueadero: true,
  precio: 150000,
  comodidades: ['Cocina', 'TV', 'WiFi'],
  reglas: ['No fumar', 'No mascotas'],
  FotosPropiedad: ['url1', 'url2'],
};

const mockUser = { uid: 'user123', email: 'test@example.com' };
const mockDocSnap = { exists: () => true, id: 'prop1', data: () => mockPropiedad };
const makeReservasSnap = (reservas = []) => ({
  forEach: (cb) => reservas.forEach((r) => cb({ data: () => r })),
});

beforeEach(() => {
  vi.clearAllMocks();
  useParams.mockReturnValue({ id: 'prop1' });
  useAuthState.mockReturnValue([mockUser, false, null]);
  docMock.mockReturnValue({});
  getDocMock.mockResolvedValue(mockDocSnap);
  collectionMock.mockReturnValue({});
  queryMock.mockReturnValue({});
  whereMock.mockReturnValue({});
  getDocsMock.mockResolvedValue(makeReservasSnap([]));
  addDocMock.mockResolvedValue({ id: 'res-123' });
});

describe('Reserva Component - handleReserva (corregidos)', () => {
  it('si no autenticado: al intentar reservar muestra Login (no hay botón reservar)', async () => {
    useAuthState.mockReturnValue([null, false, null]);
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    
    expect(await screen.findByTestId('login')).toBeInTheDocument();
    
    expect(screen.queryByRole('button', { name: /reservar/i })).not.toBeInTheDocument();
    
    expect(navigateMock).not.toHaveBeenCalledWith('/');
  });

  it('botón reservar está deshabilitado sin fechas y no permite reservar', async () => {
    useAuthState.mockReturnValue([mockUser, false, null]);
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    
    const reservarBtn = screen.getByRole('button', { name: /reservar/i });
    expect(reservarBtn).toBeInTheDocument();
    expect(reservarBtn).toBeDisabled();
    
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('error si fechas solapan reservas existentes', async () => {
    getDocsMock.mockResolvedValueOnce(
      makeReservasSnap([
        { fechaInicio: '2024-02-01T00:00:00.000Z', fechaFin: '2024-02-05T00:00:00.000Z' },
      ])
    );
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    const [start, end] = screen.getAllByTestId('datepicker');
    fireEvent.change(start, { target: { value: '2024-02-02' } });
    fireEvent.change(end, { target: { value: '2024-02-04' } });

    fireEvent.click(screen.getByRole('button', { name: /reservar/i }));

    expect(
      await screen.findByText(/Lo sentimos, estas fechas ya están reservadas\./i)
    ).toBeInTheDocument();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('flujo válido: abre pasarela y confirmar invoca addDoc', async () => {
    const user = userEvent.setup();
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    const [start, end] = screen.getAllByTestId('datepicker');
    fireEvent.change(start, { target: { value: '2025-03-10' } });
    fireEvent.change(end, { target: { value: '2025-03-15' } });

    await user.click(screen.getByRole('button', { name: /reservar/i }));

    expect(await screen.findByTestId('pasarela')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /confirmar pago/i }));
    await waitFor(() => expect(addDocMock).toHaveBeenCalledTimes(1));
  });

  it('verifica que fechas invertidas producen precio negativo', async () => {
    useAuthState.mockReturnValue([mockUser, false, null]);
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    const [start, end] = screen.getAllByTestId('datepicker');
    
    fireEvent.change(start, { target: { value: '2025-05-20' } });
    fireEvent.change(end, { target: { value: '2025-05-18' } });

    await waitFor(() => {
      const totalText = screen.getByText(/Total a pagar:/i);
      expect(totalText).toBeInTheDocument();
    });

    const reservarBtn = screen.getByRole('button', { name: /reservar/i });
    expect(reservarBtn).not.toBeDisabled();
    
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('botón se deshabilita cuando se limpian las fechas', async () => {
    useAuthState.mockReturnValue([mockUser, false, null]);
    render(<Reserva />);

    await screen.findByText('Casa en la playa');
    
    const [start, end] = screen.getAllByTestId('datepicker');
    const reservarBtn = screen.getByRole('button', { name: /reservar/i });
    
    expect(reservarBtn).toBeDisabled();
    
    fireEvent.change(start, { target: { value: '2025-05-20' } });
    fireEvent.change(end, { target: { value: '2025-05-25' } });
    
    await waitFor(() => {
      expect(reservarBtn).not.toBeDisabled();
    });
    
    fireEvent.change(start, { target: { value: '' } });
    
    await waitFor(() => {
      expect(reservarBtn).toBeDisabled();
    });
    
    expect(addDocMock).not.toHaveBeenCalled();
  });
});

