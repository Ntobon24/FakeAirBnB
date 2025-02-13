import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../../firebase/firebaseConfig"; // Asegúrate de que la importación sea correcta
import { useNavigate } from "react-router-dom";
import "./PropertyList.css";
import Carrousel from "../Gallery/Carrousel";

const PropertyList = ( {propiedades}) => {
  const navigate = useNavigate();

  return (
    <div className="property-list">
      {propiedades.map((propiedad) => (
        <div
          key={propiedad.id}
          className="property-card"
          onClick={() => navigate(`/reserva/${propiedad.id}`)}
        >
          
          <Carrousel FotosPropiedad={propiedad.FotosPropiedad} idPropiedad={propiedad.id} />
          <h3>{propiedad.titulo}</h3>
          <p>{propiedad.descripcion}</p>
          <p>
            <strong>Ubicación:</strong> {propiedad.ubicacion}
          </p>
          <p >
            ${propiedad.precio} por noche
          </p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
