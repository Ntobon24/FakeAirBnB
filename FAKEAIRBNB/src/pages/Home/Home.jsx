import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import FilterBar from "../../components/FilterBar/FilterBar";
import MapWithMarkers from "../../components/MapWithMarkers/MapWithMarkers";
import PropertyList from "../../components/PropertyList/PropertyList";
import "./Home.css";
import SearchBar from "../../components/SearchBar/SearchBar";


const Home = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState([])
  const [propiedadesFiltradasBase, setPropiedadesFiltradasBase] = useState([]);
  const [searchData, setSearchData] = useState({location: "", startDate: null, endDate: null, guestsSearch: 0})
  const [filterData, setFilterData] = useState({guests: 0, rooms: 0, bathrooms:0, maxPrice: 2000000, pets: false, pool: false, wifi: false})
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const obtenerPropiedades = async () => {
      setLoading(true);

      try{
      const querySnapshot = await getDocs(collection(db, "propiedades"));
      const propiedadesArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropiedades(propiedadesArray);
      setPropiedadesFiltradas(propiedadesArray);
      setPropiedadesFiltradasBase(propiedadesArray);
      } catch (error) {
        console.error("Error obteniendo propiedades de firebase:", error);
      } finally {
        setLoading(false);
      }  
    };
    obtenerPropiedades();
  }, []);

  const obtenerReservas = async() =>{
    setLoading(true);

    try{
      const reservasRef = collection(db, "reservas"); 
      const querySnapshot = await getDocs(reservasRef);
      const reservas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));    
      console.log("reservas obtenidas: ",reservas)
      return reservas;
    }
    catch(error){
      console.error("Error obteniendo todas las reservas")
      return[];
    }
    finally {
    setLoading(false);
  }
  };

  //Elimina tildes de un stirng
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = async (datosBusqueda) => {
    setSearchData(datosBusqueda);

    const reservas = await obtenerReservas();

    const propiedadesDisponibles = propiedades.filter((propiedad) => {

      const estaReservada = reservas.some((reserva) => {
        const reservaFechaInicio = new Date(reserva.fechaInicio);
        const reservaFechaFin = new Date(reserva.fechaFin);
    
        return reserva.propiedadId === propiedad.id && (
            (datosBusqueda.startDate >= reservaFechaInicio && datosBusqueda.startDate <= reservaFechaFin) ||
            (datosBusqueda.endDate >= reservaFechaInicio && datosBusqueda.endDate <= reservaFechaFin) ||
            (datosBusqueda.startDate <= reservaFechaInicio && datosBusqueda.endDate >= reservaFechaFin)
        );
      });

      const coincideLocacion = (datosBusqueda.location === "" || 
        (removeAccents(propiedad.ubicacion)).toLowerCase().includes((removeAccents(datosBusqueda.location)).toLowerCase()));

      return coincideLocacion && !estaReservada;

    });

    setPropiedadesFiltradas(propiedadesDisponibles);
    setPropiedadesFiltradasBase(propiedadesDisponibles);
  };

  const handleFilter = (datosFiltro) => {

    setFilterData(datosFiltro);
    const propiedadesDisponiblesFiltradas = propiedadesFiltradasBase.filter((propiedad) => {

      console.log("Propiedades antes del filtro:", propiedadesFiltradasBase);
      console.log("Filtro aplicado:", datosFiltro);
      const cumpleHuespedes = propiedad.maxPersonas >= datosFiltro.guests;
      const cumpleHabitaciones = propiedad.habitaciones >= datosFiltro.rooms;
      const cumpleBanos = propiedad.banos >= datosFiltro.bathrooms;
      const cumplePrecio = propiedad.precio <= datosFiltro.price;
      const cumpleMascotas = datosFiltro.pets ? propiedad.mascotasPermitidas === true : true;
      const cumplePiscina = datosFiltro.pool ? propiedad.piscina === true : true;
      const cumpleWifi = datosFiltro.wifi ? propiedad.wifi === true : true;
  
      return cumpleHuespedes && cumpleHabitaciones && cumpleBanos && cumplePrecio && cumpleMascotas && cumplePiscina && cumpleWifi;
    });;

    setPropiedadesFiltradas(propiedadesDisponiblesFiltradas);
  };


  return (
    <div className="home-container"> 
      <SearchBar onSearch={handleSearch}/>
      <hr className="divider"/>
      <FilterBar onFilterChange={handleFilter} />
      <div className="mapa-inicio"/>
      <MapWithMarkers propiedades={propiedadesFiltradas} />
      {loading ? (
        <p className="mensaje-cargando">Cargando propiedades...</p>
      ) : propiedadesFiltradas.length === 0 ? (
        <h2>No hay propiedades disponibles para tu busqueda</h2>
      ) : (
        <PropertyList propiedades={propiedadesFiltradas} />
      )}
    </div>
  );
};

export default Home;
