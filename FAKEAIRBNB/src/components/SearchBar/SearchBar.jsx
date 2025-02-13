import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "./SearchBar.css";

const SearchBar = ( {onSearch}) => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mensaje, setMensaje] = useState("");
  

    const handleSearchSubmit = () => {
        if (!startDate || !endDate) {
            setMensaje("Selecciona un rango de fechas válido."); // Establecemos el mensaje de error
            return; 
        }
        
        setMensaje(""); 
        onSearch({ location, startDate, endDate})
    };

    return (
        <div className="search-filter-bar">
            <div className="search-bar-container">
                <div className="group-data">
                    <label>Ubicación</label>
                    <input className="input-location" type="text" value={location} placeholder="¿A dónde vas?" onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="group-data">
                    <label>Fecha de inicio</label>
                    <DatePicker className="date" selected={startDate}  onChange={date => setStartDate(date)} minDate={new Date()} />
                </div>
                <div className="group-data">
                    <label>Fecha de fin</label>
                    <DatePicker className="date"  selected={endDate} onChange={date => setEndDate(date)} minDate={startDate} />   
                </div> 
                
                <button className="btn-search" onClick={handleSearchSubmit}>Buscar</button>
            </div>
            {mensaje && <span className="error-mensaje">{mensaje}</span>}
                      
        </div>
        
      );
  
};

export default SearchBar;