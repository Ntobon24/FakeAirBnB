import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createContext } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'

vi.mock('react-router-dom', () => ({
  useParams: vi.fn()
}))

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn()
}))

vi.mock('../../firebase/firebaseConfig', () => ({
  default: {},
  db: {},
  auth: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  addDoc: vi.fn()
}))

vi.mock('react-datepicker', () => {
  return {
    default: ({ selected, onChange, minDate, excludeDates }) => (
      <input
        data-testid="datepicker"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = new Date(e.target.value)
          onChange(date)
        }}
        min={minDate ? minDate.toISOString().split('T')[0] : ''}
      />
    )
  }
})

vi.mock('../../components/Gallery/Gallery', () => {
  return {
    default: () => <div data-testid="gallery">Gallery Component</div>
  }
})

vi.mock('../../components/PasarelaPagosFake/PasarelaPagosFake', () => {
  return {
    default: ({ onClose, onConfirm }) => (
      <div data-testid="pasarela">
        <button onClick={onClose}>Cerrar</button>
        <button onClick={onConfirm}>Confirmar Pago</button>
      </div>
    )
  }
})

vi.mock('../../components/CommentsList/CommentsList', () => {
  return {
    default: () => <div data-testid="comments">Comments Component</div>
  }
})

vi.mock('../RegistroInicio/Login', () => {
  return {
    default: () => <div data-testid="login">Login Component</div>
  }
})

import Reserva from '../../pages/Reserva/Reserva'

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
  FotosPropiedad: ['url1', 'url2']
}

const mockUser = {
  uid: 'user123',
  email: 'test@example.com'
}

const mockDocSnap = {
  exists: () => true,
  id: 'prop1',
  data: () => mockPropiedad
}

const mockReservasSnapshot = {
  forEach: vi.fn()
}

describe('Reserva Component - handleReserva Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useParams.mockReturnValue({ id: 'prop1' })
    useAuthState.mockReturnValue([mockUser, false, null])
    
    const { doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore')
    doc.mockReturnValue({})
    getDoc.mockResolvedValue(mockDocSnap)
    collection.mockReturnValue({})
    getDocs.mockResolvedValue(mockReservasSnapshot)
    query.mockReturnValue({})
    where.mockReturnValue({})
  })

  // TEST 1:
  it('debe mostrar mensaje cuando el usuario no está autenticado', async () => {

    useAuthState.mockReturnValue([null, false, null])

    render(<Reserva />)

    await waitFor(() => {
      expect(screen.getByText('Casa en la playa')).toBeInTheDocument()
    })

    const reserveButton = screen.getByText('Reservar')
    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByText('Debes iniciar sesión para reservar.')).toBeInTheDocument()
    })
  })

  // TEST 2:
  it('debe mostrar mensaje cuando no se seleccionan fechas', async () => {
    render(<Reserva />)

    await waitFor(() => {
      expect(screen.getByText('Casa en la playa')).toBeInTheDocument()
    })

    const reserveButton = screen.getByText('Reservar')
    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByText('Selecciona un rango de fechas válido.')).toBeInTheDocument()
    })
  })

  // TEST 3:
  it('debe mostrar mensaje cuando las fechas están reservadas', async () => {

    const mockReservasSnapshot = {
      forEach: vi.fn((callback) => {

        callback({
          data: () => ({
            fechaInicio: '2024-02-01T00:00:00.000Z',
            fechaFin: '2024-02-05T00:00:00.000Z'
          })
        })
      })
    }

    const { getDocs } = require('firebase/firestore')
    getDocs.mockResolvedValue(mockReservasSnapshot)

    render(<Reserva />)

    await waitFor(() => {
      expect(screen.getByText('Casa en la playa')).toBeInTheDocument()
    })

    const datepickers = screen.getAllByTestId('datepicker')
    const startDateInput = datepickers[0]
    const endDateInput = datepickers[1]

    fireEvent.change(startDateInput, { target: { value: '2024-02-02' } })
    fireEvent.change(endDateInput, { target: { value: '2024-02-04' } })

    const reserveButton = screen.getByText('Reservar')
    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByText('Lo sentimos, estas fechas ya están reservadas.')).toBeInTheDocument()
    })
  })
})
