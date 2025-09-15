import React from "react";
import PropTypes from "prop-types";
import PropertyCard from "../PropertyCard/PropertyCard";
import propiedadPropType from "../../propTypes/PropiedadProptype.jsx";
import "./PropertyList.css";

const PropertyList = ({ propiedades }) => {
  return (
    <div className="property-list">
      {propiedades.map((propiedad) => (
        <PropertyCard key={propiedad.id} propiedad={propiedad} />
      ))}
    </div>
  );
};

PropertyList.propTypes = {
  propiedades: PropTypes.arrayOf(propiedadPropType).isRequired,
};

export default PropertyList;
