import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./FilterBar.css";

const FilterBar = ({ onFilterChange, filterData }) => {
  const maxPrice = 2000000;
  const [filters, setFilters] = useState(filterData);

  useEffect(() => {
    setFilters(filterData);
  }, [filterData]);

  const pointerPosition = (filters.maxPrice / maxPrice) * 100;

  const handleFilterSubmit = () => {
    onFilterChange(filters);
  };

  return (
    <div className="filter-bar">
      <div className="inputs-container">
        <div className="filter-group">
          <label htmlFor="guests">Huéspedes</label>
          <input
            className="input-data"
            id="guests"
            type="number"
            value={filters.guests}
            min="0"
            onChange={(e) =>
              setFilters({ ...filters, guests: Number(e.target.value) })
            }
          />
        </div>

        <div className="filter-group">
          <label htmlFor="rooms">Habitaciones</label>
          <input
            className="input-data"
            id="rooms"
            type="number"
            value={filters.rooms}
            min="0"
            onChange={(e) =>
              setFilters({ ...filters, rooms: Number(e.target.value) })
            }
          />
        </div>

        <div className="filter-group">
          <label htmlFor="bathrooms">Baños</label>
          <input
            className="input-data"
            id="bathrooms"
            type="number"
            value={filters.bathrooms}
            min="0"
            onChange={(e) =>
              setFilters({ ...filters, bathrooms: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="price-slider-container">
        <label htmlFor="price-slider" className="price-label">
          Precio máximo
        </label>
        <input
          id="price-slider"
          className="price-slider"
          type="range"
          min={0}
          max={maxPrice}
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters({ ...filters, maxPrice: Number(e.target.value) })
          }
          aria-label="Precio máximo"
        />
        <div
          className="pointer-slider"
          style={{ left: `${pointerPosition}%` }}
        ></div>
      </div>

      <div className="filter-group">
        <span>Precio máximo </span>
        <div className="price-value"> ${filters.maxPrice.toLocaleString()}</div>
      </div>

      <div className="checks-container">
        <button
          className={`toggle-btn ${filters.pets ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, pets: !filters.pets })}
          aria-pressed={filters.pets}
          type="button"
        >
          Mascotas
        </button>

        <button
          className={`toggle-btn ${filters.pool ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, pool: !filters.pool })}
          aria-pressed={filters.pool}
          type="button"
        >
          Piscina
        </button>

        <button
          className={`toggle-btn ${filters.wifi ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, wifi: !filters.wifi })}
          aria-pressed={filters.wifi}
          type="button"
        >
          WiFi
        </button>
      </div>

      <button className="btn-filter" onClick={handleFilterSubmit}>
        Filtrar
      </button>
    </div>
  );
};

FilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  filterData: PropTypes.shape({
    guests: PropTypes.number,
    rooms: PropTypes.number,
    bathrooms: PropTypes.number,
    maxPrice: PropTypes.number,
    pets: PropTypes.bool,
    pool: PropTypes.bool,
    wifi: PropTypes.bool,
  }).isRequired,
};

export default FilterBar;
