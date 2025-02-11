import React, { useState } from "react";
import "./FilterBar.css";

const FilterBar = ({ propiedades, onFilterChange }) => {
  const maxPrice = 100000000;
  const [price, setPrice] = useState(maxPrice);
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(0);
  
  const pointerPosition = (price / maxPrice) * 100;

  //Elimina tildes de un stirng
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  //retorna array propiedades filtradas
  const propiedadesFiltradas = propiedades.filter((propiedad) =>{
    return (
      propiedad.precio <= price && 
      (location === "" || 
        (removeAccents(propiedad.ubicacion)).toLowerCase().includes((removeAccents(location)).toLowerCase()))
    );
  });
  
  const handleFilterChange = () => {

    onFilterChange(propiedadesFiltradas );
  };

  return (
    <div className="filter-bar">    
      <div className="filter-group">
      <label htmlFor="location">Ubicación</label>
      <input 
        className="input-data"
        id="location"
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      </div>
      
      <div className="filter-group"> 
      <label htmlFor="guests">Huespedes</label>
      <input 
        className="input-data"
        id="guests"
        type="number"
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
      />
      </div>

      <div className="price-slider-container">       
          <input
            className="price-slider"
            type="range"
            min={0}
            max= {maxPrice}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <div 
            className="pointer-slider" 
            style={{ left: `${pointerPosition}%` }} >
          </div>
        </div>  
        
      <div className="filter-group">
        <span>Precio máximo </span>
        <div className="price-value"> $ {price.toLocaleString()}</div> 
      </div> 
      

      <button 
        className="btn-filter"
        onClick={handleFilterChange}>Filtrar
      </button>

    </div>
  );
};

export default FilterBar;
