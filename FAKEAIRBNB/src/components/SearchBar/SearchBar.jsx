import React, { useState, useEffect} from "react";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import "./SearchBar.css";

const SearchBar = ({ onSearch, searchData }) => {
  const [filters, setFilters] = useState(searchData);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setFilters(searchData);
  }, [searchData]);

  const handleSearchSubmit = () => {
    if (!filters.startDate || !filters.endDate) {
      setMensaje("Selecciona un rango de fechas válido.");
      return;
    }

    setMensaje("");
    onSearch(filters);
  };

  return (
    <div className="search-filter-bar">
      <div className="search-bar-container">
        <div className="group-data">
          <label htmlFor="location">Ubicación</label>
          <input
            id="location"
            data-testid="location"
            className="input-location"
            type="text"
            value={filters.location}
            placeholder="¿A dónde vas?"
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
        </div>

        <div className="group-data">
          <label htmlFor="start-date">Fecha de inicio</label>
          <DatePicker
            id="start-date"
            className="date"
            selected={filters.startDate}
            onChange={(date) => setFilters({...filters, startDate: date})}
            minDate={filters.startDate}
          />
        </div>

        <div className="group-data">
          <label htmlFor="end-date">Fecha de fin</label>
          <DatePicker
            id="end-date"
            className="date"
            selected={filters.endDate}
            onChange={(date) => setFilters({...filters, endDate: date})}
            minDate={filters.startDate}
          />
        </div>

        <button className="btn-search" data-testid="buscar" onClick={handleSearchSubmit}>
          Buscar
        </button>
      </div>

      {mensaje && <span className="error-mensaje">{mensaje}</span>}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  searchData: PropTypes.shape({
    location: PropTypes.string,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    guestsSearch: PropTypes.number,
  }).isRequired,
};

export default SearchBar;
