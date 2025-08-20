import React from "react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import AvailabilityNotification from "../AvailabilityNotification/AvailabilityNotification";
import "./PropertyCard.css";


const PropertyCard = ({ propiedad }) => {
  const navigate = useNavigate();

  // Función helper para obtener la imagen correcta
  const getPropertyImage = (propiedad) => {
    if (propiedad.imagenes && propiedad.imagenes.length > 0) {
      return propiedad.imagenes[0];
    }
    if (propiedad.FotosPropiedad && propiedad.FotosPropiedad.length > 0) {
      return propiedad.FotosPropiedad[0];
    }
    return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  };

  return (
    <div className="property-card">
      <div className="property-image-container">
        <img 
          src={getPropertyImage(propiedad)}
          alt={propiedad.titulo}
          className="property-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
          }}
        />
        <FavoriteButton propiedad={propiedad} />
      </div>
      
      <div className="property-info">
        <h3>{propiedad.titulo}</h3>
        <p className="property-location">
          <i className="fas fa-map-marker-alt"></i>
          {propiedad.ubicacion}
        </p>
        <p className="property-description">{propiedad.descripcion}</p>
        <p className="property-price">${propiedad.precio} por noche</p>
        
        <div className="property-features">
          <span><i className="fas fa-users"></i> {propiedad.maxPersonas} personas</span>
          <span><i className="fas fa-bed"></i> {propiedad.habitaciones} habitaciones</span>
          <span><i className="fas fa-bath"></i> {propiedad.banos} baños</span>
        </div>

        <button 
          className="btn-ver-detalles"
          onClick={() => navigate(`/reserva/${propiedad.id}`)}
        >
          Ver Detalles
        </button>
        
        <AvailabilityNotification propiedad={propiedad} />
      </div>
    </div>
  );
};

export default PropertyCard;
