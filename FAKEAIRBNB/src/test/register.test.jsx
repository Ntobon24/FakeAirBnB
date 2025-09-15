import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../pages/RegistroInicio/Register'
const { createUserWithEmailAndPassword } = await import('firebase/auth')

vi.mock('../firebase/firebaseConfig', () => ({
    __esModule: true,
    default: {}
  }))
  
  vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({})),
    createUserWithEmailAndPassword: vi.fn()
  }))
  
  const mockLogout = vi.fn()
  let mockUsuario = null
  vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
      usuario: mockUsuario,
      logout: mockLogout
    })
  }))

  const renderWithProviders = (ui) =>
    render(<BrowserRouter>{ui}</BrowserRouter>)
  
  describe('Register.jsx - 3 validaciones', () => {
    const onClose = vi.fn()
  
    beforeEach(() => {
      vi.clearAllMocks()
      mockUsuario = null
    })

    it('registro OK con credenciales válidas: llama a Firebase y cierra (onClose)', async () => {
      createUserWithEmailAndPassword.mockResolvedValueOnce({
        user: { email: 'nuevo@ejemplo.com' }
      })
  
      renderWithProviders(<Register onClose={onClose} />)
  
      fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
        target: { value: 'nuevo@ejemplo.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
        target: { value: '123456' }
      })
      fireEvent.click(screen.getByRole('button', { name: /registrate/i }))
  
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'nuevo@ejemplo.com',
          '123456'
        )
      })
  
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
    })

    it('muestra el mensaje de error cuando Firebase rechaza el registro', async () => {
      createUserWithEmailAndPassword.mockRejectedValueOnce(
        new Error('Correo ya registrado')
      )
  
      renderWithProviders(<Register onClose={onClose} />)
  
      fireEvent.change(screen.getByPlaceholderText(/ingresar email/i), {
        target: { value: 'existente@correo.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/ingresar contraseña/i), {
        target: { value: '123456' }
      })
      fireEvent.click(screen.getByRole('button', { name: /registrate/i }))
  
      expect(await screen.findByText('Correo ya registrado')).toBeInTheDocument()
      expect(onClose).not.toHaveBeenCalled()
    })
  
    it('muestra error si los campos están vacíos y no llama a Firebase', async () => {
      renderWithProviders(<Register onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: /registrate/i }))
  
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
      expect(
        await screen.findByText('Por favor completa todos los campos')
      ).toBeInTheDocument()
      expect(onClose).not.toHaveBeenCalled()
    })
  })