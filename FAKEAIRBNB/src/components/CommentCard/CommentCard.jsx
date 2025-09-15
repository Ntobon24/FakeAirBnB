import React from "react";
import PropTypes from "prop-types";
import "./CommentCard.css";


const PropertyCard = ({ calificacion }) => {

    const convertirFecha = (fechaIso) => {
        const date = new Date(fechaIso);
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    };


    return (
        <div className="comment-card-container">
            <div className="user-info">
                <h3>{calificacion.usuarioEmail}</h3>     
            </div>
            <div className="comment-date-info">
                <div className="contenedor-estrellas-puntaje">
                    {[1, 2, 3, 4, 5].map((valor) => (
                        <span 
                            key={valor}
                            className={`estrella ${valor <= calificacion.puntaje ? "seleccionada-card" : "card"}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <p>{convertirFecha(calificacion.fechaPublicacion)}</p>
            </div>
            
            <div className="comment-content"> 
                <p>{calificacion.comentario}</p>
            </div>        
        </div>
    );
};

PropertyCard.propTypes = {
  calificacion: PropTypes.shape({
    usuarioEmail: PropTypes.string.isRequired,
    puntaje: PropTypes.number.isRequired,
    fechaPublicacion: PropTypes.string.isRequired,
    comentario: PropTypes.string,
  }).isRequired,
};

export default PropertyCard;