import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Login from "../RegistroInicio/Login";
import "./Reserva.css";
import Galeria from "../../components/Gallery/Gallery";
import PasarelaPagos from "../../components/PasarelaPagosFake/PasarelaPagosFake";

const Reserva = () => {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [propiedad, setPropiedad] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrecio, setTotalPrecio] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [fechasReservadas, setFechasReservadas] = useState([]);

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

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const reservasRef = collection(db, "reservas");
        const q = query(reservasRef, where("propiedadId", "==", id));
        const querySnapshot = await getDocs(q);

        let fechasOcupadas = [];
        querySnapshot.forEach((doc) => {
          const reserva = doc.data();
          let inicio = new Date(reserva.fechaInicio);
          let fin = new Date(reserva.fechaFin);

          while (inicio <= fin) {
            fechasOcupadas.push(new Date(inicio));
            inicio.setDate(inicio.getDate() + 1);
          }
        });

        setFechasReservadas(fechasOcupadas);
      } catch (error) {
        console.error("Error obteniendo reservas:", error);
      }
    };

    fetchReservas();
  }, [id]);

  useEffect(() => {
    if (startDate && endDate) {
      const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
      setTotalPrecio(days * (propiedad?.precio || 0));
    }
  }, [startDate, endDate, propiedad]);

  const verificarDisponibilidad = async () => {
    for (const fecha of fechasReservadas) {
      if (startDate <= fecha && endDate >= fecha) {
        return false;
      }
    }
    return true;
  };

  const handleReserva = async () => {
    if (!user) {
      setMensaje("Debes iniciar sesión para reservar.");
      return;
    }
    if (!startDate || !endDate) {
      setMensaje("Selecciona un rango de fechas válido.");
      return;
    }

    const disponible = await verificarDisponibilidad();
    if (!disponible) {
      setMensaje("Lo sentimos, estas fechas ya están reservadas.");
      return;
    }

    try {
      await addDoc(collection(db, "reservas"), {
        propiedadId: propiedad.id,
        titulo: propiedad.titulo,
        ubicacion: propiedad.ubicacion,
        precioPorNoche: propiedad.precio,
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
        totalPrecio,
        usuarioId: user.uid,
        usuarioEmail: user.email,
      });

      setMensaje("Reserva confirmada. ¡Gracias por reservar!");
    } catch (error) {
      console.error("Error al reservar:", error);
      setMensaje("Hubo un error al procesar la reserva.");
    }
  };

  if (!propiedad) return <p>Cargando...</p>;

  return (
    <div className="reserva">
      <h2>{propiedad.titulo}</h2>

      <div className="galeria-container">
        <Galeria FotosPropiedad={propiedad.FotosPropiedad} />
      </div>

      <div className="contenido-principal">
        <h3>{propiedad.descripcion}</h3>
        <h4>Ubicación: {propiedad.ubicacion}</h4>
        <h4>Clima: {propiedad.clima}</h4>

        <div className="detalles-propiedad">
          <p>🏠 {propiedad.habitaciones} habitaciones</p>
          <p>🚿 {propiedad.banos} baños</p>
          <p>👥 Capacidad máxima: {propiedad.maxPersonas} personas</p>
          <p>🐶 Mascotas permitidas: {propiedad.mascotasPermitidas ? "Sí" : "No"}</p>
          <p>📶 Wifi: {propiedad.wifi ? "Sí" : "No"}</p>
          <p>🏊 Piscina: {propiedad.piscina ? "Sí" : "No"}</p>
          <p>❄️ Aire acondicionado: {propiedad.aireAcondicionado ? "Sí" : "No"}</p>
          <p>🚗 Parqueadero: {propiedad.parqueadero ? "Sí" : "No"}</p>
        </div>

        <h4>🛋️ Comodidades:</h4>
        <ul>
          {propiedad.comodidades.map((comodidad, index) => (
            <li key={index}>✔️ {comodidad}</li>
          ))}
        </ul>

        <h4>🚫 Reglas:</h4>
        <ul>
          {propiedad.reglas.map((regla, index) => (
            <li key={index}>⚠️ {regla}</li>
          ))}
        </ul>

        <PasarelaPagos />
      </div>

      <div className="cajita-separada-infocasa">
        <h5>${propiedad.precio.toLocaleString()} COP</h5>
        <p>por noche</p>

        <div className="datepicker-container">
          <label>Fecha de inicio:</label>
          <DatePicker
            className="fechita"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            minDate={new Date()}
            excludeDates={fechasReservadas}
          />

          <label>Fecha de fin:</label>
          <DatePicker
            className="fechita"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            minDate={startDate}
            excludeDates={fechasReservadas}
          />
        </div>

        <p>Total a pagar: ${totalPrecio.toLocaleString()} COP</p>

        {!user ? (
          <Login />
        ) : (
          <button className="btn-de-reserva" onClick={handleReserva} disabled={!startDate || !endDate}>
            Reservar
          </button>
        )}

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </div>
  );
};

export default Reserva;
