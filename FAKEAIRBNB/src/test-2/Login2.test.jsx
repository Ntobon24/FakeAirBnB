import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'


//Mock de firebase
vi.mock('../firebase/firebaseConfig', () => ({
  __esModule: true,
  default: {}
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn()
}))

//Mock del contexto autenticacion usuario
const mockLogout = vi.fn()
let mockUsuario = null
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    usuario: mockUsuario,
    logout: mockLogout
  })
}))

//Mock navegacion, sustituye redirigir
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock del modal y registro
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

describe('Componente Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsuario = null
  })


  it('debe iniciar sesion correctamente con credenciales validas', async () => {

    //Arrange
    const userTest = {
    email: 'test@ejemplo.com',
    password: '123456'}

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: userTest.email }
    })

    renderWithProviders(<Login />)

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    //Act: interaccion llenar fomulario login
    fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
      target: { value: userTest.email }
    })
    fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
      target: { value: userTest.password }
    })
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    //Assert

    //funcion llamada con parametros correctos
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        userTest.email,
        userTest.password
      )
    })

    //Modal se cerro tras login: equivale should().BeNull()
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull()
    })

    //No estar mensaje de error: equivale should().BeNull()
    expect(screen.queryByText(/por favor completa todos los campos/i)).toBeNull()
  })

  
    it('debe mostrar mensaje de error cuando las credenciales son inválidas', async () => {

        //Arrange
        const userTest = {
            email: 'mal@correo.com',
            password: 'incorrecta'
        }

        signInWithEmailAndPassword.mockRejectedValueOnce(
            new Error('Credenciales inválidas')
        )

        renderWithProviders(<Login />)

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

        //Act: llenar formulario login
        fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
            target: { value: userTest.email }
        })
        fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
            target: { value: userTest.password }
        })
        fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

        //Assert

        //Should().BeEquivalentTo()
        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            userTest.email,
            userTest.password
            )
        })

        //Should().NotBeNull()
        const errorMsg = await screen.findByText('Credenciales inválidas')
        expect(errorMsg).not.toBeNull()
        expect(errorMsg).toBeInTheDocument()


        //Should().NotBeNull()
        expect(screen.queryByTestId('modal')).not.toBeNull()
    })

    it('debe mostrar error si los campos están vacíos y no llamar a Firebase', async () => {
        
        //Arrange
        renderWithProviders(<Login />)
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

        // Act: click continuar sin ingresar datos
        fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

        //Assert

        //Should().NotBeCalled()
        expect(signInWithEmailAndPassword).not.toHaveBeenCalled()

        //Should().BeInTheDocument()
        expect(
            await screen.findByText('Por favor completa todos los campos')
        ).toBeInTheDocument()

        expect(screen.queryByTestId('modal')).not.toBeNull()
    })

    it('debe abrir el formulario de registro y cerrar el modal de login al hacer clic en "Crear cuenta nueva"', async () => {

        //Arrange
        renderWithProviders(<Login />)

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
        expect(screen.queryByTestId('modal')).not.toBeNull()

        //Act: click crear nueva cuenta
        fireEvent.click(screen.getByRole('button', { name: /crear cuenta nueva/i }))

        //Assert

        //verifica abrio componente de registro
        await waitFor(() => {
            expect(screen.getByTestId('register')).toBeInTheDocument()
        })

        expect(screen.getByText('Registro')).toBeInTheDocument()
        })

        it('debe mostrar el mensaje de bienvenida y opciones cuando el usuario esta autenticado', () => {
    
            //Arrange
            const userTest = { email: 'usuarioAutenticado@test.com' }
            mockUsuario = userTest
            
            renderWithProviders(<Login />)
            
            //Assert
            
            //Should().BeInTheDocument()
            expect(screen.getByText(`Bienvenido, ${userTest.email}`)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /ver mis reservas/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
            
            //Should().BeNull()
            expect(screen.queryByRole('button', { name: /iniciar sesión/i })).toBeNull()
        })

})
