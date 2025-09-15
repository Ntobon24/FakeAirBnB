import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import Home from '../pages/Home/Home'

vi.mock('../firebase/firebaseConfig', () => ({
  default: {},
  db: {},
  auth: {},
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn()
}))

//Se simulan los metodos con funciones vacias para no acceder a la bd
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  
}))

// Mock props test 1
const mockProps = [
    {
        id: 'p1',
        titulo: 'Cabaña rustica santa Elena',
        precio: 250000,
        maxPersonas: 3, habitaciones: 1, banos: 1,
        mascotasPermitidas: true, wifi: true, piscina: false
    },
    {
        id: 'p2',
        titulo: 'Apartamento centro',
        precio: 300000,
        maxPersonas: 1, habitaciones: 1, banos: 1,
        mascotasPermitidas: false, wifi: false, piscina: false
    }

];
        

let filterBarValues;

//Reemplaza componente FilterBar boton, ejecuta OnFilterChange envia DatosFiltrados validos
vi.mock('../components/FilterBar/FilterBar', () => ({
  default: ({ onFilterChange }) => (
    <button data-testid="aplicar-filtro"
      onClick={() => onFilterChange(filterBarValues)}
    >
      Aplicar filtro
    </button>
  )
}))

//mock SearchBar no ejecuta
vi.mock('../components/SearchBar/SearchBar', () => ({
  default: () => null }))

//Mock mapa no ejecuta
vi.mock('../components/MapWithMarkers/MapWithMarkers', () => ({
  default: () => null
}))

//Mocks propertyList -> muestra titulos, propiedades filtradas(validar)
vi.mock("../components/PropertyList/PropertyList", () => ({
    default: ({ propiedades }) => (
    <ul>
      {propiedades.map((p) => (
        <li key={p.id}>{p.titulo}</li>
      ))}
    </ul>
  ),
}));

describe('FilterBar component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
        filterBarValues = {};
    })

        //TEST 1
        it('incluye propiedad cuando cumple capacidad y precio sin importar preferencias', async () => {
            
            const { getDocs } = await import('firebase/firestore')

            getDocs.mockResolvedValueOnce({
                docs: mockProps.map((p) => ({id: p.id, data: () => ({...p}) }))
            });

            getDocs.mockResolvedValueOnce({
                docs: []
            })

            // mock filtros (pets, pool, wifi = false)
            filterBarValues = {
                guests: 1,
                rooms: 1,
                bathrooms: 1,
                maxPrice: 1000000,
                pets: false,
                pool: false,
                wifi: false
            }

            render(<Home />)

            expect(await screen.findByText('Cabaña rustica santa Elena')).toBeInTheDocument();
            expect(await screen.findByText('Apartamento centro')).toBeInTheDocument();
            // Ejecutar filtro
            fireEvent.click(screen.getByTestId('aplicar-filtro'))

            // Esperar que la propiedad pase el filtro se muestre
            expect(await screen.findByText('Cabaña rustica santa Elena')).toBeInTheDocument();
            expect(await screen.findByText('Apartamento centro')).toBeInTheDocument();
            
        })


        //TEST 2 validar retorno de lista vacia
        it('excluye todas las propiedades cuando no cumplen almenos una condicion', async () => {


            const { getDocs } = await import('firebase/firestore')

            getDocs.mockResolvedValueOnce({
                docs: mockProps.map((p) => ({id: p.id, data: () => ({...p}) }))
            });

            getDocs.mockResolvedValueOnce({
                docs: []
            })

            // mock filtros -> forzar condicion imposible 
            filterBarValues = {
                guests: 1,
                rooms: 1,
                bathrooms: 1,
                maxPrice: 10,
                pets: false,
                pool: false,
                wifi: false
            }

            render(<Home />)

            expect(await screen.findByText('Cabaña rustica santa Elena')).toBeInTheDocument();
            expect(await screen.findByText('Apartamento centro')).toBeInTheDocument();

            // Ejecutar filtro
            fireEvent.click(screen.getByTestId('aplicar-filtro'))

            // Esperar resultado lista vacia, mensaje
            await waitFor(() => {
                expect(screen.queryByText("Cabaña rustica santa Elena")).not.toBeInTheDocument();
                expect(screen.queryByText("Apartamento centro")).not.toBeInTheDocument();
                expect(screen.getByText("No hay propiedades disponibles para tu búsqueda")).toBeInTheDocument();
            })

        })

        //TEST 3 
        it('Incluye una propiedad cuando cumple todas las condiciones', async () => {

            const { getDocs } = await import('firebase/firestore')

            getDocs.mockResolvedValueOnce({
                docs: mockProps.map((p) => ({id: p.id, data: () => ({...p}) }))
            });

            getDocs.mockResolvedValueOnce({
                docs: []
            })

            // mock filtros -> forzar condicion imposible 
            filterBarValues = {
                guests: 1,
                rooms: 1,
                bathrooms: 1,
                maxPrice: 500000,
                pets: true,
                pool: false,
                wifi: true
            }

            render(<Home />)

            expect(await screen.findByText('Cabaña rustica santa Elena')).toBeInTheDocument();
            expect(await screen.findByText('Apartamento centro')).toBeInTheDocument();

            // Ejecutar filtro
            fireEvent.click(screen.getByTestId('aplicar-filtro'))

            // Esperar retorna solo 1 propiedad
            await waitFor(() => {
                expect(screen.getByText("Cabaña rustica santa Elena")).toBeInTheDocument();
                expect(screen.queryByText("Apartamento centro")).not.toBeInTheDocument();
            })

        })

})

