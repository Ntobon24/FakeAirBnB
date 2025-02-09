// src/pages/AddPropertiesOnce.jsx

import React, { useEffect } from 'react';
import { addProperty } from '../../firebase/firebasfunctions';

const AddPropertiesOnce = () => {
  useEffect(() => {
    const properties = [
        {
            titulo: "Cómodo Apartamento en Poblado",
            descripcion: "Apartamento moderno, ideal para una pareja o pequeño grupo. Con excelente vista a la ciudad.",
            precio: 25000000,
            ubicacion: "El Poblado, Medellín, Colombia",
            lat: 6.2075,
            lng: -75.5743
          },
          {
            titulo: "Casa Grande en Envigado",
            descripcion: "Casa espaciosa con jardín y piscina, ubicada en una zona tranquila y segura de Envigado.",
            precio: 45000000,
            ubicacion: "Envigado, Medellín, Colombia",
            lat: 6.1500,
            lng: -75.6050
          },
          {
            titulo: "Apartamento Con Vista en Laureles",
            descripcion: "Hermoso apartamento con terraza y vista panorámica en el corazón de Laureles.",
            precio: 30000000,
            ubicacion: "Laureles, Medellín, Colombia",
            lat: 6.2322,
            lng: -75.5783
          }
    ];

    properties.forEach(property => addProperty(property));

  }, []); // Solo se ejecuta una vez cuando el componente se monta

  return (
    <div>
      <h1>Propiedades cargadas a Firestore</h1>
      <p>Las propiedades se han agregado correctamente a Firestore.</p>
    </div>
  );
};

export default AddPropertiesOnce;
