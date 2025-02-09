import "./header.css";

const Header = () => {
    return (
      <header className="header">
        <div className="logo"> airbnb </div>
        <input type="text" placeholder="¿A dónde vas?" className="search-bar" />
        <button  className="prop-option">Pon tu espacio en Airbnb </button>
        <button className="user-options"> Iniciar Sesion</button>
      </header>
    );
  };
  
export default Header;
  