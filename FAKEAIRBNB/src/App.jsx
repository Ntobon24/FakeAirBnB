import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import PropertyList from "./components/PropertyList/PropertyList";
import Reserva from "./pages/Reserva/Reserva";
import MapWithMarkers from "./components/MapWithMarkers/MapWithMarkers";
import AddPropertiesOnce from "./pages/AddPropertiesOnce/AddPropertiesOnce";
import HistorialReservas from "./pages/HistorialReservas/HistorialReservas";
import Header from "./components/Estructure/Header";
import UpdatePropertyImages from "./pages/UpdatePropertyImages/UpdatePropertyImages";
import "./App.css";


function App() {
  return (
    
    <Router>
      <div className="cajita-grande">
        <Header />
        <main className="content">

        <Routes> 
          <Route path="/" element={<Home />} />
          <Route path="/propiedades" element={<PropertyList />} />
          <Route path="/reserva/:id" element={<Reserva />} />
          <Route path="/mapa" element={<MapWithMarkers />} />
          <Route path="/add-properties" element={<AddPropertiesOnce />}/>
          <Route path="/historial-reservas" element={<HistorialReservas />} />
          <Route path="/update-property-images" element={<UpdatePropertyImages/>}/>
          
        </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
