import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import FilterBar from "../../components/FilterBar/FilterBar";
import MapWithMarkers from "../../components/MapWithMarkers/MapWithMarkers";
import PropertyList from "../../components/PropertyList/PropertyList";
import "./Home.css";


const Home = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState([])

  useEffect(() => {
    const obtenerPropiedades = async () => {
      const querySnapshot = await getDocs(collection(db, "propiedades"));
      const propiedadesArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropiedades(propiedadesArray);
      setPropiedadesFiltradas(propiedadesArray);
    };
    obtenerPropiedades();
  }, []);


  return (
    <div className="home-container">
      <FilterBar propiedades={propiedades} onFilterChange={setPropiedadesFiltradas} />
      <MapWithMarkers propiedades={propiedadesFiltradas} />
      <PropertyList propiedades={propiedadesFiltradas} />
    
    </div>
  );
};

export default Home;
