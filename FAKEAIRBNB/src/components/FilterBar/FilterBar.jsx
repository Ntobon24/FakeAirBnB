import React, { useState } from "react";
import "./FilterBar.css";

const FilterBar = ({onFilterChange }) => {
  
  const maxPrice = 2000000
  const [guests, setGuests] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [price, setPrice] = useState(maxPrice);
  const [pets, setPets] = useState(false);
  const [pool, setPool] = useState(false);
  const [wifi, setWifi] = useState(false);
  ;
  
  const pointerPosition = (price / maxPrice) * 100;

  const handleFilterChange = () => {   
    onFilterChange({guests: guests, rooms: rooms, bathrooms: bathrooms, maxPrice: price, pets: pets, pool: pool, wifi: wifi });
  };

  return (
    <div className="filter-bar"> 

      <div className="inputs-container">
        <div className="filter-group"> 
        <label htmlFor="guests">Huespedes</label>
        <input 
          className="input-data"
          id="guests"
          type="number"
          value={guests}
          min="0"
          onChange={(e) => setGuests(Number(e.target.value))}
        />
        </div>

        <div className="filter-group">
        <label htmlFor="rooms">Habitaciones</label>
        <input 
          className="input-data"
          id="rooms"
          type="number"
          value={rooms}
          min="0"
          onChange={(e) => setRooms(Number(e.target.value))}
        />
        </div>

        <div className="filter-group">
        <label htmlFor="bathrooms">Baños</label>
        <input 
          className="input-data"
          id="bathrooms"
          type="number"
          value={bathrooms}
          min="0"
          onChange={(e) => setBathrooms(Number(e.target.value))}
        />
        </div>
      </div>   
       

      <div className="price-slider-container">       
          <label htmlFor="price-slider" className="price-label">Precio máximo</label>
          <input
            id="price-slider"
            className="price-slider"
            type="range"
            min={0}
            max= {maxPrice}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Precio máximo"
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

      <div className="checks-container">
        <button 
          className={`toggle-btn ${pets ? "active" : ""}`}
          onClick={() => setPets(!pets)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPets(!pets);
            }
          }}
          aria-pressed={pets}
          type="button"
        > 
          Mascotas 
        </button>

        <button 
          className={`toggle-btn ${pool ? "active" : ""}`}
          onClick={() => setPool(!pool)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPool(!pool);
            }
          }}
          aria-pressed={pool}
          type="button"
        > 
          Piscina 
        </button>

        <button 
          className={`toggle-btn ${wifi ? "active" : ""}`}
          onClick={() => setWifi(!wifi)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setWifi(!wifi);
            }
          }}
          aria-pressed={wifi}
          type="button"
        > 
          WiFi
        </button>
      </div>
      
      <button 
        className="btn-filter"
        onClick={handleFilterChange}>Filtrar
      </button>

    </div>
  );
};

export default FilterBar;
