import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { createContext } from 'react'

const AuthContext = createContext()
import Favoritos from '../pages/Favoritos/Favoritos'

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

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const mockAuthContext = {
  usuario: {
    uid: 'test-user-id',
    email: 'test@example.com'
  }
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}))

const renderWithProviders = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

describe('Favoritos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // TEST 1:
  it('debe obtener y mostrar la lista de favoritos correctamente', async () => {
    const mockFavoritos = [
      {
        id: 'fav1',
        titulo: 'Casa en la playa',
        ubicacion: 'Cancún, México',
        precio: 150,
        imagen: 'test-image.jpg',
        propiedadId: 'prop1',
        fechaAgregado: { toDate: () => new Date('2024-01-01') }
      }
    ]

    const mockSnapshot = {
      docs: mockFavoritos.map(fav => ({
        id: fav.id,
        data: () => fav
      }))
    }

    const { getDocs } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)

    renderWithProviders(<Favoritos />)

    await waitFor(() => {
      expect(screen.getByText('Casa en la playa')).toBeInTheDocument()
      expect(screen.getByText('$150 por noche')).toBeInTheDocument()
    })
  })

  // TEST 2:
  it('debe mostrar mensaje cuando no hay favoritos', async () => {
    const mockSnapshot = {
      docs: []
    }

    const { getDocs } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)

    renderWithProviders(<Favoritos />)

    await waitFor(() => {
      expect(screen.getByText('No tienes favoritos aún')).toBeInTheDocument()
    })
  })

  // TEST 3:
  it('debe eliminar un favorito correctamente', async () => {
    const mockFavoritos = [
      {
        id: 'fav1',
        titulo: 'Casa en la playa',
        ubicacion: 'Cancún, México',
        precio: 150,
        imagen: 'test-image.jpg',
        propiedadId: 'prop1',
        fechaAgregado: { toDate: () => new Date('2024-01-01') }
      }
    ]

    const mockSnapshot = {
      docs: mockFavoritos.map(fav => ({
        id: fav.id,
        data: () => fav
      }))
    }

    const { getDocs, deleteDoc } = await import('firebase/firestore')
    getDocs.mockResolvedValue(mockSnapshot)
    deleteDoc.mockResolvedValue()

    renderWithProviders(<Favoritos />)

    await waitFor(() => {
      expect(screen.getByText('Casa en la playa')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTitle('Eliminar de favoritos')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  // TEST 4:
  it('debe manejar errores al obtener favoritos', async () => {
    const { getDocs } = await import('firebase/firestore')
    getDocs.mockRejectedValue(new Error('Error de conexión'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<Favoritos />)

    await waitFor(() => {
      expect(screen.getByText('Error obteniendo favoritos')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })
})
