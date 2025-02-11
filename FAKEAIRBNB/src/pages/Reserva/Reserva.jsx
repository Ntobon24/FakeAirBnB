import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Reserva.css";

const Reserva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth); 
  const [propiedad, setPropiedad] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrecio, setTotalPrecio] = useState(0);
  const [mensaje, setMensaje] = useState("");

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
    if (startDate && endDate) {
      const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
      setTotalPrecio(days * (propiedad?.precio || 0));
    }
  }, [startDate, endDate, propiedad]);

  const verificarDisponibilidad = async () => {
    const reservasRef = collection(db, "reservas");
    const q = query(reservasRef, where("propiedadId", "==", propiedad.id));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const reserva = doc.data();
      const inicioReservado = new Date(reserva.fechaInicio);
      const finReservado = new Date(reserva.fechaFin);

      if (
        (startDate >= inicioReservado && startDate <= finReservado) ||
        (endDate >= inicioReservado && endDate <= finReservado) ||
        (startDate <= inicioReservado && endDate >= finReservado)
      ) {
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
      <p>{propiedad.descripcion}</p>
      <p>Precio por noche: ${propiedad.precio}</p>
      <p>Ubicación: {propiedad.ubicacion}</p>

      <div className="datepicker-container">
        <label>Fecha de inicio:</label>
        <DatePicker selected={startDate} onChange={date => setStartDate(date)} minDate={new Date()} />

        <label>Fecha de fin:</label>
        <DatePicker selected={endDate} onChange={date => setEndDate(date)} minDate={startDate} />
      </div>

      <p>Total a pagar: ${totalPrecio.toFixed(2)}</p>

      {!user ? (
        <button onClick={() => navigate("/")}>Iniciar sesión para reservar</button>
      ) : (
        <button onClick={handleReserva} disabled={!startDate || !endDate}>Reservar</button>
      )}

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default Reserva;
