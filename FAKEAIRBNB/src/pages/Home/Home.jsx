import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import MapWithMarkers from "../../components/MapWithMarkers/MapWithMarkers";
import PropertyList from "../../components/PropertyList/PropertyList";
import "./Home.css";

const Home = () => {
  const [propiedades, setPropiedades] = useState([]);

  useEffect(() => {
    const obtenerPropiedades = async () => {
      const querySnapshot = await getDocs(collection(db, "propiedades"));
      const propiedadesArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropiedades(propiedadesArray);
    };
    obtenerPropiedades();
  }, []);

  return (
    <div className="home-container">
      <MapWithMarkers propiedades={propiedades} />
      <PropertyList propiedades={propiedades} />
    </div>
  );
};

export default Home;
