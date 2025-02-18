import React from "react";
import { useEffect, useState } from "react";
import { doc, getDoc} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./ServiceRating.css";

const ServiceRating = ({reserva, onClose, onConfirm}) => {

    const [propiedad, setPropiedad] = useState(null);
    const [puntaje, setPuntaje] = useState(0);
    const [comentario, setComentario] = useState("");
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");

    const descripcionesPuntaje = {
      1: "Muy mala",
      2: "Mala",
      3: "Regular",
      4: "Buena",
      5: "Excelente"
    };

    if (!reserva) {
        console.error("Error obteniendo la reserva del historial de reservas", error);
        return;
    }

    useEffect(() => {
        const fetchPropiedad = async () => {
          try {
            const docRef = doc(db, "propiedades", reserva.propiedadId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setPropiedad({ id: docSnap.id, ...docSnap.data() });
            } else {
              console.log("No existe la propiedad");
            }
          } catch (error) {
            console.error("Error obteniendo la propiedad:", error);
          } finally {
            setLoading(false);
          }
        };  
        fetchPropiedad();
      }, [reserva]);

      const handleConfirmServiceRating = () => {
        if (puntaje === 0) {
            setMensaje("Selecciona un puntaje de estrellas válido."); // Establecemos el mensaje de error
            return; 
        }
        
        const comentarioValido = comentario.trim();
        if(comentarioValido.length < 5){
          setMensaje("El comentario debe tener almenor 5 caracteres.");
          return;
        } 
        setMensaje(""); 
        
        onConfirm({
          reservaId: reserva.id,
          usuarioId: reserva.usuarioId,
          propiedadId: reserva.propiedadId,
          usuarioEmail: reserva.usuarioEmail,
          puntaje, 
          comentario: comentarioValido,
          fechaPublicacion: (new Date()).toISOString(),
        });
    };

    return (
        
        <div>
        
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Como fue tu experiencia en</h4>   
              </div>
              <div className="modal-body">
                {loading ? (
                    <p className="mensaje-cargando">Cargando informacion de la propiedad</p>
                ) : propiedad.empty ? (
                    <h2>No se encontro la propiedad</h2>
                ) : (
                    <div className="contenedor-info-propiedad">
                        <h3 className="titulo-propiedad">{propiedad.titulo}</h3>
                        <div className="contenedor-imagen-propiedad">
                            <img className="imagen-propiedad" 
                                src={propiedad.FotosPropiedad[0]}
                            />
                        </div>
                    </div>
                )}
                <form className="formu-rating">
                  <div className="contenedor-puntaje">
                    <div className="contenedor-estrellas-puntaje">
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <button 
                        key={valor}
                        className={`estrella ${valor <= puntaje ? "seleccionada" : ""}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setPuntaje(valor)}}
                      >
                        ★
                      </button>
                    ))}
                    </div>
                    <p className="texto-puntaje">{descripcionesPuntaje[puntaje]}</p>
                  </div>
                  <textarea className="comentario-input"
                    placeholder="Agrega un comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  >
                  </textarea>
                  {mensaje && <span className="error-mensaje">{mensaje}</span>}
                  
                </form>
              </div>
              <div className="modal-footer">

                {/* Estos son los botones que si confirma llama a la funcion pagar y si no pues no hace nada */}
                <button className="btn-pasarela-cancelar" onClick={onClose}>
                  Cancelar 
                </button>

                <button className="btn-pasarela-pagos" onClick={handleConfirmServiceRating}>
                  Enviar calificacion
                </button>
              </div>
            </div>
          </div>
        </div>
    

    </div>

    );
};

export default ServiceRating;