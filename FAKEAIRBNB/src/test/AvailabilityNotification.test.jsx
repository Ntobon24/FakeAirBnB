import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createContext } from 'react'
const AuthContext = createContext()
import AvailabilityNotification from '../components/AvailabilityNotification/AvailabilityNotification'

vi.mock('../firebase/firebaseConfig', () => ({
  default: {},
  db: {},
  auth: {},
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {}
}))

const mockAlert = vi.fn()
global.alert = mockAlert

const mockAuthContext = {
  usuario: {
    uid: 'test-user-id',
    email: 'test@example.com'
  }
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

const mockPropiedad = {
  id: 'prop1',
  titulo: 'Casa en la playa',
  ubicacion: 'Cancún, México'
}

const renderWithProviders = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  )
}

describe('AvailabilityNotification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // TEST 1:
  it('debe suscribirse correctamente cuando se proporcionan fechas válidas', async () => {
    const mockSnapshot = {
      empty: true
    }

    const { getDocs, addDoc } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)
    addDoc.mockResolvedValue({ id: 'notification1' })

    renderWithProviders(<AvailabilityNotification propiedad={mockPropiedad} />)

    const subscribeButton = screen.getByText('Notificar Disponibilidad')
    fireEvent.click(subscribeButton)

    const inputs = screen.getAllByDisplayValue('')
    const startDateInput = inputs[0]
    const endDateInput = inputs[1]
    
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } })
    fireEvent.change(endDateInput, { target: { value: '2024-02-05' } })

    const confirmButton = screen.getByText('Suscribirse')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          usuarioId: 'test-user-id',
          usuarioEmail: 'test@example.com',
          propiedadId: 'prop1',
          titulo: 'Casa en la playa',
          ubicacion: 'Cancún, México',
          fechaInicio: '2024-02-01',
          fechaFin: '2024-02-05',
          activa: true
        })
      )
      expect(mockAlert).toHaveBeenCalledWith('Te has suscrito exitosamente a las notificaciones de disponibilidad')
    })
  })

  // TEST 2:
  it('debe desuscribirse correctamente', async () => {
    const mockSnapshot = {
      empty: false,
      docs: [{ id: 'notification1' }]
    }

    const { getDocs, deleteDoc } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)
    deleteDoc.mockResolvedValue()

    renderWithProviders(<AvailabilityNotification propiedad={mockPropiedad} />)

    await waitFor(() => {
      expect(screen.getByText('Cancelar Notificación')).toBeInTheDocument()
    })

    const unsubscribeButton = screen.getByText('Cancelar Notificación')
    fireEvent.click(unsubscribeButton)

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled()
      expect(mockAlert).toHaveBeenCalledWith('Te has desuscrito de las notificaciones')
    })
  })

  // TEST 3:
  it('debe verificar correctamente si el usuario está suscrito', async () => {
    const mockSnapshot = {
      empty: false
    }

    const { getDocs } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)

    renderWithProviders(<AvailabilityNotification propiedad={mockPropiedad} />)

    await waitFor(() => {
      expect(screen.getByText('Cancelar Notificación')).toBeInTheDocument()
    })
  })

  // TEST 4:
  it('debe manejar errores al suscribirse', async () => {
    const mockSnapshot = {
      empty: true
    }

    const { getDocs, addDoc } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)
    addDoc.mockRejectedValue(new Error('Error de conexión'))

    renderWithProviders(<AvailabilityNotification propiedad={mockPropiedad} />)

    const subscribeButton = screen.getByText('Notificar Disponibilidad')
    fireEvent.click(subscribeButton)

    const inputs = screen.getAllByDisplayValue('')
    const startDateInput = inputs[0]
    const endDateInput = inputs[1]
    
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } })
    fireEvent.change(endDateInput, { target: { value: '2024-02-05' } })

    const confirmButton = screen.getByText('Suscribirse')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Error al suscribirse')).toBeInTheDocument()
    })
  })
})
