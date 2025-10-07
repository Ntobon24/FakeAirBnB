import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Notificaciones.css';

const Notificaciones = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario) {
      navigate("/");
      return;
    }

    obtenerNotificaciones();
  }, [usuario, navigate]);

  const obtenerNotificaciones = async () => {
    try {
      const notificacionesQuery = query(
        collection(db, "notificaciones_disponibilidad"),
        where("usuarioId", "==", usuario.uid)
      );
      const snapshot = await getDocs(notificacionesQuery);
      
      const notificacionesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      setNotificaciones(notificacionesData);
    } catch (error) {
      setError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const eliminarNotificacion = async (notificacionId) => {
    try {
      await deleteDoc(doc(db, "notificaciones_disponibilidad", notificacionId));
      setNotificaciones(notificaciones.filter(notif => notif.id !== notificacionId));
      alert("Notificación eliminada exitosamente");
    } catch (error) {
      setError("Error al eliminar la notificacion");
    }
  };

  const irAPropiedad = (propiedadId) => {
    navigate(`/reserva/${propiedadId}`);
  };

  if (loading) {
    return (
      <div className="notificaciones-container">
        <h2>Mis Notificaciones</h2>
        <p>Cargando notificaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notificaciones-container">
        <h2>Mis Notificaciones</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="notificaciones-container">
      <h2>Mis Notificaciones de Disponibilidad</h2>
      {notificaciones.length === 0 ? (
        <div className="no-notificaciones">
          <i className="fas fa-bell-slash"></i>
          <h3>No tienes notificaciones activas</h3>
          <p>Suscríbete a notificaciones de disponibilidad para recibir alertas cuando las propiedades que te interesan estén libres</p>
          <button 
            className="btn-explorar"
            onClick={() => navigate("/")}
          >
            Explorar Propiedades
          </button>
        </div>
      ) : (
        <div className="notificaciones-grid">
          {notificaciones.map((notificacion) => (
            <div key={notificacion.id} className="notificacion-card">
              <div className="notificacion-header">
                <i className="fas fa-bell"></i>
                <span className="notificacion-status">Activa</span>
              </div>
              
              <div className="notificacion-info">
                <h3>{notificacion.titulo}</h3>
                <p className="ubicacion">
                  <i className="fas fa-map-marker-alt"></i>
                  {notificacion.ubicacion}
                </p>
                
                <div className="fechas-interes">
                  <h4>Fechas de interés:</h4>
                  <p>
                    <i className="fas fa-calendar-alt"></i>
                    {new Date(notificacion.fechaInicio).toLocaleDateString()} - {new Date(notificacion.fechaFin).toLocaleDateString()}
                  </p>
                </div>
                
                <p className="fecha-suscripcion">
                  Suscrito el {notificacion.fechaSuscripcion?.toDate().toLocaleDateString()}
                </p>
              </div>
              
              <div className="notificacion-actions">
                <button 
                  className="btn-ver-propiedad"
                  onClick={() => irAPropiedad(notificacion.propiedadId)}
                >
                  Ver Propiedad
                </button>
                <button 
                  className="btn-eliminar-notificacion"
                  onClick={() => eliminarNotificacion(notificacion.id)}
                  title="Eliminar notificación"
                >
                  <i className="fas fa-trash"></i>{" "}
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
