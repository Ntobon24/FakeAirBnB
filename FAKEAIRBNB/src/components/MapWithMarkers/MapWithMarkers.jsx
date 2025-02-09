import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig'; // Asegúrate de importar tu configuración de Firebase

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 6.2442,
  lng: -75.5812
};

const MapWithMarkers = () => {
  const [map, setMap] = useState(null);
  const [propiedades, setPropiedades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "propiedades"));
      const propiedadesArray = querySnapshot.docs.map(doc => doc.data());
      setPropiedades(propiedadesArray);
    };
    
    fetchData();
  }, []);

  const onLoad = mapInstance => {
    setMap(mapInstance);
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_FIREBASE_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
      >
        {propiedades.map((propiedad, index) => (
          <Marker
            key={index}
            position={{
              lat: parseFloat(propiedad.lat),
              lng: parseFloat(propiedad.lng)
            }}
            title={propiedad.titulo}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithMarkers;
