import React from "react";
import { useNavigate } from "react-router-dom";
import "./PropertyCard.css";


const PropertyCard = ({ propiedad }) => {
  const navigate = useNavigate();

  return (
    <div className="property-card">
      <h3>{propiedad.titulo}</h3>
      
      <p>{propiedad.descripcion}</p>
      <p>Precio: ${propiedad.precio}</p>

      <button onClick={() => navigate(`/reserva/${propiedad.id}`)}>
        Ver Detalles
      </button>
    </div>
  );
};

export default PropertyCard;
