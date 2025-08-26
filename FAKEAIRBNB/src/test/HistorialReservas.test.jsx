import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}))

vi.mock('../../firebase/firebaseConfig', () => ({
  default: {}
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn()
}))

vi.mock('../../components/ServiceRating/ServiceRating', () => {
  return {
    default: ({ reserva, onClose, onConfirm }) => (
      <div data-testid="service-rating">
        <h3>Calificar: {reserva?.titulo}</h3>
        <button onClick={onClose}>Cancelar</button>
        <button onClick={() => onConfirm({
          reservaId: reserva?.id,
          usuarioId: reserva?.usuarioId,
          propiedadId: reserva?.propiedadId,
          usuarioEmail: reserva?.usuarioEmail,
          puntaje: 5,
          comentario: "Excelente estadía",
          fechaPublicacion: new Date().toISOString()
        })}>
          Confirmar Calificación
        </button>
      </div>
    )
  }
})

import HistorialReservas from '../../pages/HistorialReservas/HistorialReservas'

const mockUsuario = {
  uid: 'user123',
  email: 'test@example.com'
}

const mockNavigate = vi.fn()

const mockReservas = [
  {
    id: 'reserva1',
    titulo: 'Casa en la playa',
    ubicacion: 'Cancún, México',
    fechaInicio: '2024-01-01T00:00:00.000Z',
    fechaFin: '2024-01-05T00:00:00.000Z',
    precioPorNoche: 150000,
    totalPrecio: 600000,
    usuarioId: 'user123',
    usuarioEmail: 'test@example.com',
    propiedadId: 'prop1'
  },
  {
    id: 'reserva2',
    titulo: 'Apartamento en la ciudad',
    ubicacion: 'Medellín, Colombia',
    fechaInicio: '2024-02-01T00:00:00.000Z',
    fechaFin: '2024-02-10T00:00:00.000Z',
    precioPorNoche: 200000,
    totalPrecio: 1800000,
    usuarioId: 'user123',
    usuarioEmail: 'test@example.com',
    propiedadId: 'prop2'
  }
]

const mockReservasSnapshot = {
  docs: mockReservas.map(reserva => ({
    id: reserva.id,
    data: () => reserva
  }))
}

const mockCalificacionesSnapshot = {
  empty: true
}

describe('HistorialReservas Component - confirmarCalificacion Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useAuth.mockReturnValue({ usuario: mockUsuario })
    useNavigate.mockReturnValue(mockNavigate)
    
    const { collection, query, where, getDocs, addDoc, deleteDoc, doc } = require('firebase/firestore')
    collection.mockReturnValue({})
    query.mockReturnValue({})
    where.mockReturnValue({})
    getDocs.mockResolvedValue(mockReservasSnapshot)
    addDoc.mockResolvedValue({ id: 'calificacion1' })
    deleteDoc.mockResolvedValue()
    doc.mockReturnValue({})
  })

  // TEST 1:
  it('debe agregar calificación y eliminar reserva exitosamente', async () => {
    const { addDoc, deleteDoc, doc } = require('firebase/firestore')
    
    render(<HistorialReservas />)

    await waitFor(() => {
      expect(screen.getByText('Mis Reservas')).toBeInTheDocument()
    })

    const ratingButtons = screen.getAllByText('Calificar estadia')
    fireEvent.click(ratingButtons[0])

    const confirmButton = screen.getByText('Confirmar Calificación')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          reservaId: 'reserva1',
          usuarioId: 'user123',
          propiedadId: 'prop1',
          usuarioEmail: 'test@example.com',
          puntaje: 5,
          comentario: 'Excelente estadía'
        })
      )
    })

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('La reserva ha sido liberada y calificada correctamente.')).toBeInTheDocument()
    })
  })

  // TEST 2:
  it('debe manejar error al agregar calificación', async () => {
    const { addDoc } = require('firebase/firestore')
    addDoc.mockRejectedValue(new Error('Error de conexión'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<HistorialReservas />)

    await waitFor(() => {
      expect(screen.getByText('Mis Reservas')).toBeInTheDocument()
    })

    const ratingButtons = screen.getAllByText('Calificar estadia')
    fireEvent.click(ratingButtons[0])

    const confirmButton = screen.getByText('Confirmar Calificación')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al agregar la calificacion:', expect.any(Error))
    })

    const { deleteDoc } = require('firebase/firestore')
    expect(deleteDoc).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  // TEST 3:
  it('debe manejar error al eliminar reserva pero continuar el proceso', async () => {
    const { addDoc, deleteDoc } = require('firebase/firestore')
    addDoc.mockResolvedValue({ id: 'calificacion1' })
    deleteDoc.mockRejectedValue(new Error('Error al eliminar'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<HistorialReservas />)

    await waitFor(() => {
      expect(screen.getByText('Mis Reservas')).toBeInTheDocument()
    })

    const ratingButtons = screen.getAllByText('Calificar estadia')
    fireEvent.click(ratingButtons[0])

    const confirmButton = screen.getByText('Confirmar Calificación')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al eliminar la reserva:', expect.any(Error))
    })

    await waitFor(() => {
      expect(screen.getByText('La reserva ha sido liberada y calificada correctamente.')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })
})
