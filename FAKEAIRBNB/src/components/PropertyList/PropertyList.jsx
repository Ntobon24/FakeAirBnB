import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../../firebase/firebaseConfig"; // Asegúrate de que la importación sea correcta
import { useNavigate } from "react-router-dom";
import "./PropertyList.css";

const PropertyList = () => {
  const [propiedades, setPropiedades] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener las propiedades de Firebase
    const fetchProperties = async () => {
      try {
        // Ahora 'collection' y 'getDocs' funcionan correctamente
        const querySnapshot = await getDocs(collection(db, "propiedades"));
        const propiedadesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPropiedades(propiedadesData);
      } catch (error) {
        console.error("Error al obtener propiedades:", error);
      }
    };

    fetchProperties();
  }, []);

  if (propiedades.length === 0) {
    return <p>Cargando propiedades...</p>;
  }

  return (
    <div className="property-list">
      {propiedades.map((propiedad) => (
        <div
          key={propiedad.id}
          className="property-card"
          onClick={() => navigate(`/propiedad/${propiedad.id}`)}
        >
          <h3>{propiedad.titulo}</h3>
          <p>{propiedad.descripcion}</p>
          <p>
            <strong>Ubicación:</strong> {propiedad.ubicacion}
          </p>
          <p>
            <strong>Precio:</strong> ${propiedad.precio}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
