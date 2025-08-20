import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './AvailabilityNotification.css';

const AvailabilityNotification = ({ propiedad }) => {
  const { usuario } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const checkSubscription = async () => {
    if (!usuario || !propiedad) return;
    
    try {
      const subscriptionQuery = query(
        collection(db, "notificaciones_disponibilidad"),
        where("usuarioId", "==", usuario.uid),
        where("propiedadId", "==", propiedad.id)
      );
      const snapshot = await getDocs(subscriptionQuery);
      setIsSubscribed(!snapshot.empty);
    } catch (error) {
      console.error("Error verificando suscripción:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión para suscribirte a notificaciones");
      return;
    }

    if (!startDate || !endDate) {
      alert("Por favor selecciona las fechas de tu interés");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "notificaciones_disponibilidad"), {
        usuarioId: usuario.uid,
        usuarioEmail: usuario.email,
        propiedadId: propiedad.id,
        titulo: propiedad.titulo,
        ubicacion: propiedad.ubicacion,
        fechaInicio: startDate,
        fechaFin: endDate,
        fechaSuscripcion: new Date(),
        activa: true
      });
      
      setIsSubscribed(true);
      setShowDatePicker(false);
      alert("Te has suscrito exitosamente a las notificaciones de disponibilidad");
    } catch (error) {
      console.error("Error al suscribirse:", error);
      alert("Error al suscribirse a las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!usuario) return;

    setLoading(true);
    try {
      const subscriptionQuery = query(
        collection(db, "notificaciones_disponibilidad"),
        where("usuarioId", "==", usuario.uid),
        where("propiedadId", "==", propiedad.id)
      );
      const snapshot = await getDocs(subscriptionQuery);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, "notificaciones_disponibilidad", snapshot.docs[0].id));
      }
      
      setIsSubscribed(false);
      alert("Te has desuscrito de las notificaciones");
    } catch (error) {
      console.error("Error al desuscribirse:", error);
      alert("Error al desuscribirse de las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkSubscription();
  }, [usuario, propiedad]);

  if (!usuario) {
    return (
      <button
        className="notification-button"
        onClick={() => alert("Debes iniciar sesión para suscribirte a notificaciones")}
        title="Inicia sesión para recibir notificaciones"
      >
        <i className="fas fa-bell"></i>
        <span>Notificar Disponibilidad</span>
      </button>
    );
  }

  return (
    <div className="notification-container">
      {!isSubscribed ? (
        <button
          className="notification-button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          disabled={loading}
        >
          <i className="fas fa-bell"></i>
          <span>Notificar Disponibilidad</span>
        </button>
      ) : (
        <button
          className="notification-button subscribed"
          onClick={handleUnsubscribe}
          disabled={loading}
        >
          <i className="fas fa-bell-slash"></i>
          <span>Cancelar Notificación</span>
        </button>
      )}

      {showDatePicker && !isSubscribed && (
        <div className="date-picker-modal">
          <div className="date-picker-content">
            <h4>¿Cuándo te interesa esta propiedad?</h4>
            <div className="date-inputs">
              <div className="date-input">
                <label>Fecha de llegada:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-input">
                <label>Fecha de salida:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="date-picker-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDatePicker(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-subscribe"
                onClick={handleSubscribe}
                disabled={loading || !startDate || !endDate}
              >
                {loading ? 'Suscribiendo...' : 'Suscribirse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityNotification;
