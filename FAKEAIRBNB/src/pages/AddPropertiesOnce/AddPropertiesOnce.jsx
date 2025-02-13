import React, { useEffect } from "react";
import { addProperty } from "../../firebase/firebasfunctions";

const AddPropertiesOnce = () => {
  useEffect(() => {
    const properties = [
      {
        titulo: "Finca en Guatapé con vista al lago",
        descripcion: "Hermosa finca con vista panorámica al embalse de Guatapé, ideal para descansar y desconectarse de la ciudad.",
        precio: 600000,
        ubicacion: "Guatapé, Antioquia, Colombia",
        lat: 6.2322,
        lng: -75.1615,
        maxPersonas: 8,
        clima: "Templado",
        habitaciones: 4,
        banos: 3,
        wifi: true,
        parqueadero: true,
        piscina: true,
        aireAcondicionado: false,
        mascotasPermitidas: true,
        FotosPropiedad: [
          "https://example.com/guatape1.jpg",
          "https://example.com/guatape2.jpg",
          "https://example.com/guatape3.jpg"
        ],
        comodidades: ["TV", "Cocina equipada", "Zona de BBQ", "Chimenea"],
        reglas: ["No fumar en el interior", "No hacer fiestas", "Respetar la fauna local"]
      },
      {
        titulo: "Apartamento en El Poblado con jacuzzi",
        descripcion: "Moderno apartamento en el sector exclusivo de El Poblado, con jacuzzi privado y hermosa vista de la ciudad.",
        precio: 350000,
        ubicacion: "El Poblado, Medellín, Colombia",
        lat: 6.2081,
        lng: -75.5673,
        maxPersonas: 4,
        clima: "Templado",
        habitaciones: 2,
        banos: 2,
        wifi: true,
        parqueadero: true,
        piscina: false,
        aireAcondicionado: true,
        mascotasPermitidas: false,
        FotosPropiedad: [
          "https://example.com/poblado1.jpg",
          "https://example.com/poblado2.jpg"
        ],
        comodidades: ["TV", "Cocina equipada", "Jacuzzi", "Gimnasio"],
        reglas: ["No se permiten mascotas", "No hacer ruido después de las 10 PM"]
      },
      {
        titulo: "Cabaña rústica en Santa Elena",
        descripcion: "Cabaña de madera rodeada de naturaleza, perfecta para una escapada romántica o un retiro espiritual.",
        precio: 250000,
        ubicacion: "Santa Elena, Antioquia, Colombia",
        lat: 6.2581,
        lng: -75.5167,
        maxPersonas: 3,
        clima: "Frío",
        habitaciones: 1,
        banos: 1,
        wifi: true,
        parqueadero: true,
        piscina: false,
        aireAcondicionado: false,
        mascotasPermitidas: true,
        FotosPropiedad: [
          "https://example.com/santaelena1.jpg",
          "https://example.com/santaelena2.jpg"
        ],
        comodidades: ["Chimenea", "Cocina equipada", "Terraza con vista"],
        reglas: ["No se permiten fiestas", "Respetar la naturaleza"]
      },
      {
        titulo: "Casa campestre en Rionegro",
        descripcion: "Casa campestre con amplios jardines, ubicada a pocos minutos del aeropuerto José María Córdova.",
        precio: 500000,
        ubicacion: "Rionegro, Antioquia, Colombia",
        lat: 6.1451,
        lng: -75.3821,
        maxPersonas: 6,
        clima: "Templado",
        habitaciones: 3,
        banos: 2,
        wifi: true,
        parqueadero: true,
        piscina: true,
        aireAcondicionado: false,
        mascotasPermitidas: true,
        FotosPropiedad: [
          "https://example.com/rionegro1.jpg",
          "https://example.com/rionegro2.jpg"
        ],
        comodidades: ["TV", "Cocina equipada", "Zona de juegos", "BBQ"],
        reglas: ["No fumar en el interior", "No hacer ruido excesivo"]
      },
      {
        titulo: "Hostal en Jericó con ambiente colonial",
        descripcion: "Encantador hostal en el corazón de Jericó, con arquitectura colonial y ambiente cálido.",
        precio: 180000,
        ubicacion: "Jericó, Antioquia, Colombia",
        lat: 5.7931,
        lng: -75.7845,
        maxPersonas: 2,
        clima: "Templado",
        habitaciones: 1,
        banos: 1,
        wifi: true,
        parqueadero: false,
        piscina: false,
        aireAcondicionado: false,
        mascotasPermitidas: true,
        FotosPropiedad: [
          "https://example.com/jerico1.jpg",
          "https://example.com/jerico2.jpg"
        ],
        comodidades: ["TV", "Cocina compartida", "Jardín"],
        reglas: ["No hacer ruido después de las 9 PM", "Respetar las normas del hostal"]
      }
    ];

    properties.forEach(property => {
      addProperty(property);
    });

  }, []);

  return (
    <div>
      <h1>Propiedades cargadas a Firestore</h1>
      <p>Las propiedades se han agregado correctamente a Firestore.</p>
    </div>
  );
};

export default AddPropertiesOnce;
