 import React, { useState } from "react";
 import "./Carrousel.css";
import PropTypes from "prop-types";

const Carrousel = ({ FotosPropiedad, idPropiedad }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    if(!FotosPropiedad || FotosPropiedad.lenth ===0){
        return <p>Fotos no disponibles</p>
    }

    const nextImage = () => {
        setCurrentIndex((prev) => ({
          ...prev,
          [idPropiedad]: (prev[idPropiedad] !== undefined ? prev[idPropiedad] + 1 : 1) % FotosPropiedad.length,
        }));
      };
    
      const prevImage = () => {
        setCurrentIndex((prev) => ({
          ...prev,
          [idPropiedad]: (prev[idPropiedad] !== undefined ? prev[idPropiedad] - 1 + FotosPropiedad.length : FotosPropiedad.length - 1) % FotosPropiedad.length,
        }));
      };

      return (
        <div id={`carousel-${idPropiedad}`} className="carousel slide">
          <div className="carousel-inner">
            {FotosPropiedad.map((img, index) => (
              <div
                key={`${idPropiedad}-${img}`} // 🔹 usamos idPropiedad + la ruta/URL de la imagen
                className={`carousel-item ${
                  index === (currentIndex[idPropiedad] || 0) ? "active" : ""
                }`}
              >
                <img
                  src={img}
                  className="d-block w-100"
                  alt={`Imagen ${index + 1}`}
                />
              </div>
            ))}
          </div>
      
          <button
            className="carousel-control-prev"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <span className="carousel-control-prev-icon"></span>
          </button>
      
          <button
            className="carousel-control-next"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      );  
};

Carrousel.propTypes = {
  FotosPropiedad: PropTypes.arrayOf(PropTypes.string).isRequired,
  idPropiedad: PropTypes.string.isRequired,
};

export default Carrousel;
