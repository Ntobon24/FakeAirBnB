import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./HistorialReservas.css";

const db = getFirestore(app);

const HistorialReservas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) {
      navigate("/"); // Redirigir a la página principal si no está autenticado
      return;
    }

    const obtenerReservas = async () => {
      try {
        const reservasRef = collection(db, "reservas");
        const q = query(reservasRef, where("usuarioEmail", "==", usuario.email));
        const snapshot = await getDocs(q);
        
        const reservasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReservas(reservasData);
      } catch (error) {
        console.error("Error obteniendo reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerReservas();
  }, [usuario, navigate]);

  return (
    <div className="historial-container">
      <h2>Mis Reservas</h2>
      {loading ? (
        <p>Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        <ul className="lista-reservas">
          {reservas.map(reserva => (
            <li key={reserva.id} className="reserva-item">
              <h3>{reserva.titulo}</h3>
              <p><strong>Ubicación:</strong> {reserva.ubicacion}</p>
              <p><strong>Fecha Inicio:</strong> {new Date(reserva.fechaInicio).toLocaleDateString()}</p>
              <p><strong>Fecha Fin:</strong> {new Date(reserva.fechaFin).toLocaleDateString()}</p>
              <p><strong>Precio por noche:</strong> ${reserva.precioPorNoche}</p>
              <p><strong>Total:</strong> ${reserva.totalPrecio}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistorialReservas;
