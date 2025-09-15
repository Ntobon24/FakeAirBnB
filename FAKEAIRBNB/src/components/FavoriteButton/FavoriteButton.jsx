import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './FavoriteButton.css';

const FavoriteButton = ({ propiedad }) => {
  const { usuario } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario && propiedad) {
      checkIfFavorite();
    }
  }, [usuario, propiedad]);

  const checkIfFavorite = async () => {
    if (!usuario) return;
    
    try {
      const favoritosQuery = query(
        collection(db, "favoritos"),
        where("usuarioId", "==", usuario.uid),
        where("propiedadId", "==", propiedad.id)
      );
      const snapshot = await getDocs(favoritosQuery);
      setIsFavorite(!snapshot.empty);
    } catch (error) {
      console.error("Error verificando favorito:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión para guardar favoritos");
      return;
    }
  
    if (!propiedad?.id) {
      console.error("Propiedad inválida:", propiedad);
      alert("Error: Propiedad no válida");
      return;
    }
  

    setLoading(true);
    try {
      if (isFavorite) {
        const favoritosQuery = query(
          collection(db, "favoritos"),
          where("usuarioId", "==", usuario.uid),
          where("propiedadId", "==", propiedad.id)
        );
        const snapshot = await getDocs(favoritosQuery);
        if (!snapshot.empty) {
          await deleteDoc(doc(db, "favoritos", snapshot.docs[0].id));
        }
        setIsFavorite(false);
      } else {
        const getPropertyImage = (propiedad) => {
          if (propiedad.imagenes && propiedad.imagenes.length > 0) {
            return propiedad.imagenes[0];
          }
          if (propiedad.FotosPropiedad && propiedad.FotosPropiedad.length > 0) {
            return propiedad.FotosPropiedad[0];
          }
          return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
        };

        await addDoc(collection(db, "favoritos"), {
          usuarioId: usuario.uid,
          usuarioEmail: usuario.email,
          propiedadId: propiedad.id,
          titulo: propiedad.titulo,
          ubicacion: propiedad.ubicacion,
          precio: propiedad.precio,
          imagen: getPropertyImage(propiedad),
          fechaAgregado: new Date()
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error al cambiar favorito:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <button
        className="favorite-button"
        onClick={() => alert("Debes iniciar sesión para guardar favoritos")}
        title="Inicia sesión para guardar favoritos"
      >
        <i className="heart-icon far fa-heart"></i>
      </button>
    );
  }

  return (
    <button
      className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <i className={`heart-icon ${isFavorite ? 'fas fa-heart' : 'far fa-heart'}`}></i>
      {loading && <span className="loading-spinner"></span>}
    </button>
  );
};

export default FavoriteButton;
