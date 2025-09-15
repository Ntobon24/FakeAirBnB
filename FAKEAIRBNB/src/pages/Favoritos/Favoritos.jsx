import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import './Favoritos.css';

const Favoritos = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuario) {
      navigate("/");
      return;
    }

    obtenerFavoritos();
  }, [usuario, navigate]);

  const obtenerFavoritos = async () => {
    try {
      const favoritosQuery = query(
        collection(db, "favoritos"),
        where("usuarioId", "==", usuario.uid)
      );
      const snapshot = await getDocs(favoritosQuery);
      
      const favoritosData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      setFavoritos(favoritosData);
    } catch (error) {
      console.error("Error obteniendo favoritos:", error);
      setError("Error obteniendo favoritos");
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (favoritoId) => {
    try {
      await deleteDoc(doc(db, "favoritos", favoritoId));
      setFavoritos(favoritos.filter(fav => fav.id !== favoritoId));
    } catch (error) {
      console.error("Error eliminando favorito:", error);
    }
  };

  const irAPropiedad = (propiedadId) => {
    navigate(`/reserva/${propiedadId}`);
  };

  if (loading) {
    return (
      <div className="favoritos-container">
        <h2>Mis Favoritos</h2>
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="favoritos-container">
      <h2>Mis Favoritos</h2>
      {loading ? (
        <p>Cargando favoritos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : 
        favoritos.length === 0 ? (
        <div className="no-favoritos">
          <i className="far fa-heart"></i>
          <h3>No tienes favoritos aún</h3>
          <p>Explora propiedades y agrega las que más te gusten a tu lista de favoritos</p>
          <button 
            className="btn-explorar"
            onClick={() => navigate("/")}
          >
            Explorar Propiedades
          </button>
        </div>
      ) : (
        <div className="favoritos-grid">
          {favoritos.map((favorito) => (
            <div key={favorito.id} className="favorito-card">
              <div className="favorito-imagen">
                <img 
                  src={favorito.imagen} 
                  alt={favorito.titulo}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible';
                  }}
                />
                <div className="favorito-overlay">
                  <button 
                    className="btn-ver-propiedad"
                    onClick={() => irAPropiedad(favorito.propiedadId)}
                  >
                    Ver Propiedad
                  </button>
                  <button 
                    className="btn-eliminar-favorito"
                    onClick={() => eliminarFavorito(favorito.id)}
                    title="Eliminar de favoritos"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="favorito-info">
                <h3>{favorito.titulo}</h3>
                <p className="ubicacion">
                  <i className="fas fa-map-marker-alt"></i>
                  {favorito.ubicacion}
                </p>
                <p className="precio">${favorito.precio} por noche</p>
                <p className="fecha-agregado">
                  Agregado el {favorito.fechaAgregado?.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
