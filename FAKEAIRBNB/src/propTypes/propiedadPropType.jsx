import PropTypes from "prop-types";

export const propiedadPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  ubicacion: PropTypes.string,
  descripcion: PropTypes.string,
  precio: PropTypes.number,
  maxPersonas: PropTypes.number,
  habitaciones: PropTypes.number,
  banos: PropTypes.number,
  imagenes: PropTypes.arrayOf(PropTypes.string),
  FotosPropiedad: PropTypes.arrayOf(PropTypes.string),
});

export default propiedadPropType;