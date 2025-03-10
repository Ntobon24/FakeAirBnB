import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 6.2442,
  lng: -75.5812
};

const MapWithMarkers = ( {propiedades} ) => {
  const [map, setMap] = useState(null);
  const navigate = useNavigate();

  
  const onLoad = mapInstance => {
    setMap(mapInstance);
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
      >
        {propiedades.map((propiedad) => (
          <Marker
            key={propiedad.id}
            position={{
              lat: parseFloat(propiedad.lat),
              lng: parseFloat(propiedad.lng)
            }}
            title={propiedad.titulo}
            onClick={() => navigate(`/reserva/${propiedad.id}`)} 
            />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithMarkers;
