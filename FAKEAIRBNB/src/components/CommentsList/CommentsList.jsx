import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
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




    return (
        <div className="comments-list">
            <h4>💬 Calificaciones:</h4>
            {loading ? (
                <p className="mensaje-cargando">Cargando calificaciones de la propiedad...</p>
            ) : calificacionesPropiedad.length === 0 ? (
                <p>Aun no existen calificaciones para esta propiedad</p>
            ) : (
                <div className="comments-list-container">
                    {calificacionesPropiedad.map((calificacion) => (
                        <CommentCard key={calificacion.id} calificacion={calificacion} />
                    ))}

                </div>
            )}
        </div>
    );
};

export default CommentsList;