import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./Reserva.css";

const Reserva = () => {
  const { id } = useParams();
  const [propiedad, setPropiedad] = useState(null);

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const docRef = doc(db, "propiedades", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPropiedad({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No existe la propiedad");
        }
      } catch (error) {
        console.error("Error obteniendo la propiedad:", error);
      }
    };

    fetchPropiedad();
  }, [id]);

  if (!propiedad) return <p>Cargando...</p>;

  return (
    <div className="reserva">
      <h2>{propiedad.titulo}</h2>
      <p>{propiedad.descripcion}</p>
      <p>Precio: ${propiedad.precio}</p>
      <p>Ubicación: {propiedad.ubicacion}</p>
      <button>Reservar</button>
    </div>
  );
};

export default Reserva;
