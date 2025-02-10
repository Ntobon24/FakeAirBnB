import "./header.css";
import Login from "../../pages/RegistroInicio/Login";


const Header = () => {

    return (
      <header className="header">
        <div className="logo"> FakeAirbnb </div>
        <input type="text" placeholder="¿A dónde vas?" className="search-bar" />
        <button  className="prop-option">Pon tu espacio en Airbnb </button>
        <Login />
      </header>
    );
  };
  
export default Header;
  