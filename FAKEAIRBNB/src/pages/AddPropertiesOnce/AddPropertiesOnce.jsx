// src/pages/AddPropertiesOnce.jsx

import React, { useEffect } from 'react';
import { addProperty } from '../../firebase/firebasfunctions';

const AddPropertiesOnce = () => {
  useEffect(() => {
    const properties = [
      {
        titulo: "Finca en Las Palmas",
        descripcion: "Hermosa finca de recreo con amplios terrenos, ideal para quienes buscan tranquilidad y contacto con la naturaleza.",
        precio: 80000000,
        ubicacion: "Las Palmas, Medellín, Colombia",
        lat: 6.2389,
        lng: -75.5547
      },
      {
        titulo: "Apartamento Duplex en La 70",
        descripcion: "Apartamento duplex con dos habitaciones, ubicado en una de las zonas más tradicionales de Medellín.",
        precio: 22000000,
        ubicacion: "La 70, Medellín, Colombia",
        lat: 6.2349,
        lng: -75.5822
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
