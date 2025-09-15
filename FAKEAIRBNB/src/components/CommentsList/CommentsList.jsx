import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import PropTypes from "prop-types";
import CommentCard from "../CommentCard/CommentCard";


const CommentsList = ( {propiedadId} ) => {
    const [calificacionesPropiedad, setCalificacionesPropiedad] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalificaciones = async () => {
            try {
                const calificacionesRef = collection(db, "calificaciones");
                const q = query(calificacionesRef, where("propiedadId", "==", propiedadId));
                const querySnapshot = await getDocs(q);
                const calificacionesList = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

                setCalificacionesPropiedad(calificacionesList);
                console.log("calificaciones:",calificacionesList);

            } catch (error) {
                console.error("Error obteniendo calificaciones de la propiedad:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCalificaciones();}, [propiedadId]);




        let content;

        switch (true) {
          case loading:
            content = (
              <p className="mensaje-cargando">
                Cargando calificaciones de la propiedad...
              </p>
            );
            break;
        
          case calificacionesPropiedad.length === 0:
            content = <p>Aun no existen calificaciones para esta propiedad</p>;
            break;
        
          default:
            content = (
              <div className="comments-list-container">
                {calificacionesPropiedad.map((calificacion) => (
                  <CommentCard key={calificacion.id} calificacion={calificacion} />
                ))}
              </div>
            );
            break;
        }
        
        return (
          <div className="comments-list">
            <h4>💬 Calificaciones:</h4>
            {content}
          </div>
        );
};

CommentsList.propTypes = {
  propiedadId: PropTypes.string.isRequired,
};

export default CommentsList;