import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../firebase/firebaseConfig', () => ({
  __esModule: true,
  default: {}
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn()
}))

const mockLogout = vi.fn()
let mockUsuario = null
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    usuario: mockUsuario,
    logout: mockLogout
  })
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../pages/RegistroInicio/Modal', () => ({
  __esModule: true,
  default: ({ show, children, onClose }) =>
    show ? (
      <div data-testid="modal">
        <button aria-label="cerrar-modal" onClick={onClose}>X</button>
        {children}
      </div>
    ) : null
}))
vi.mock('../pages/RegistroInicio/Register', () => ({
  __esModule: true,
  default: ({ onClose }) => (
    <div data-testid="register">
      <p>Registro</p>
      <button onClick={onClose}>Cerrar registro</button>
    </div>
  )
}))

import Login from '../pages/RegistroInicio/Login'
const { signInWithEmailAndPassword } = await import('firebase/auth')

const renderWithProviders = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>)

describe('Login.jsx - 3 validaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsuario = null
  })

  // 1) Login OK con credenciales válidas
  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: 'test@ejemplo.com' }
    })

    renderWithProviders(<Login />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
      target: { value: 'test@ejemplo.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
      target: { value: '123456' }
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@ejemplo.com',
        '123456'
      )
    })

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })

  // 2) Muestra error si credenciales incorrectas
  it('muestra error si credenciales incorrectas', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(
      new Error('Credenciales inválidas')
    )

    renderWithProviders(<Login />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
      target: { value: 'mal@correo.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
      target: { value: 'incorrecta' }
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })

  // 3) Campos vacíos: no llama a Firebase y muestra mensaje
  it('muestra error si los campos están vacíos y no llama a Firebase', async () => {
    renderWithProviders(<Login />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
 
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled()
    expect(
      await screen.findByText('Por favor completa todos los campos')
    ).toBeInTheDocument()
  })
})

