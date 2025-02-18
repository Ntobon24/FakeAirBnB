import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import app from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import ServiceRating from "../../components/ServiceRating/ServiceRating";
import "./HistorialReservas.css";


const db = getFirestore(app);

const HistorialReservas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState({});
  const [showServiceRating, setShowServiceRating] = useState(false);
  const [reservaServiceRating, setReservaServiceRating] = useState(null);
  const [mensajeCalificacion, setMensajeCalificacion] = useState(""); 

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

        
        //guarda calificaciones realizadas
        const calificacionesCheck={};

        // Verificar el usuario califico propiedades en actual reservas
        for(let reserva of reservasData){
          try{
            const calificacionesQuery = query(
              collection(db, "calificaciones"),
              where("reservaId", "==", reserva.id),
              where("usuarioId", "==", reserva.usuarioId)
            );
            const calificacionesGetQuery = await getDocs(calificacionesQuery);
            
            calificacionesCheck[reserva.id] = !calificacionesGetQuery.empty;
          } catch (error) {
            console.error(`Error obteniendo calificacion para la reserva ${reserva.id}:`, error);
          }    

        }

        setCalificaciones(calificacionesCheck);
      } catch (error) {
        console.error("Error obteniendo reservas:", error);
  
      } finally {
        setLoading(false);
      }
    };

    obtenerReservas();
  }, [usuario, navigate]);

  //Calculo reservas finalizadas pendientes por calificar
  const  historialReservas = reservas.map(reserva => {
    const fechaActual = new Date();
    const fechaFin = new Date(reserva.fechaFin);
    const puedeCalificar = fechaFin < fechaActual && !calificaciones[reserva.id];
    return{...reserva, puedeCalificar};
  });

  //Abrir Modal calificar estadia
  const openServiceRating = (reserva) => {
    setReservaServiceRating(reserva);
    setShowServiceRating(true);
  };

  //Cerrar Modal calificar estadia
  const closeServiceRating = () => {
    setShowServiceRating(false);
  };

  const confirmarCalificacion = async(nuevaCalificacion) => {
    console.log("Aca se agrega la clificacion a firebase", nuevaCalificacion);

    try {
      // Agregar la calificacion a calificaciones
      const docRef = await addDoc(collection(db, "calificaciones"), nuevaCalificacion);
      console.log("Calificación agregada con id: ", docRef.id);
      
      try{
        //Elimina la reserva calificada de firebase
        await deleteDoc(doc(db, "reservas", reservaServiceRating.id));
        console.log("Reserva eliminada con id: ", reservaServiceRating.id);
      } catch (error){
        console.error("Error al eliminar la reserva: ", error);
      } 

      setReservas((reservasActualizadas) => reservasActualizadas.filter((reserva) => reserva.id != reservaServiceRating.id));


      setReservaServiceRating(null);
      closeServiceRating();

      setMensajeCalificacion("La reserva ha sido liberada y calificada correctamente.")
      setTimeout(() => {setMensajeCalificacion("")}, 5000)

    } catch (error) {
      console.error("Error al agregar la calificacion: ", error);
    }

  };

  return (
    <div className="historial-container">
      <h2>Mis Reservas</h2>
      {mensajeCalificacion &&(
        <div className="mensaje-calificacion">
          <p>{mensajeCalificacion}</p>
        </div>
      )}
      {loading ? (
        <p>Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        <ul className="lista-reservas">
          {historialReservas.map(reserva => (
            <li key={reserva.id} className="reserva-item">
              <h3>{reserva.titulo}</h3>
              <p><strong>Ubicación:</strong> {reserva.ubicacion}</p>
              <p><strong>Fecha Inicio:</strong> {new Date(reserva.fechaInicio).toLocaleDateString()}</p>
              <p><strong>Fecha Fin:</strong> {new Date(reserva.fechaFin).toLocaleDateString()}</p>
              <p><strong>Precio por noche:</strong> ${reserva.precioPorNoche}</p>
              <p><strong>Total:</strong> ${reserva.totalPrecio}</p>
              
              <p className={`estado-reserva ${`estado-reserva ${reserva.puedeCalificar ? "reserva-finalizada" : "reserva-activa"}`}`}>
                <strong>Estado:</strong> {reserva.puedeCalificar ? "Finalizada" : "Activa"}
              </p>

              {reserva.puedeCalificar && (
                <button className="btn-calificar" onClick={()=> openServiceRating(reserva)}>
                   Calificar estadia
                </button>)}
              
            </li>
          ))}
        </ul>
      )}
      {showServiceRating && reservaServiceRating && (
        <ServiceRating 
          reserva={reservaServiceRating}
          onClose={closeServiceRating}
          onConfirm={confirmarCalificacion}
        />
      )}
    </div>
  
  );
};

export default HistorialReservas;
