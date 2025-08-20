import React from "react";
import PropertyCard from "../PropertyCard/PropertyCard";
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

export default PropertyList;
