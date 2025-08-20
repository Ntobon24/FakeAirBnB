import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./header.css";
import Login from "../../pages/RegistroInicio/Login";

const Header = () => {
  const { usuario } = useAuth();

  return (
    <header className="header">
      <Link to="/" className="logo">FakeAirbnb</Link>
      <div className="header-nav">
        {usuario && (
          <>
            <Link to="/favoritos" className="nav-link">
              <i className="fas fa-heart"></i>
              Favoritos
            </Link>
            <Link to="/notificaciones" className="nav-link">
              <i className="fas fa-bell"></i>
              Notificaciones
            </Link>
          </>
        )}
        <Login />
      </div>
    </header>
  );
};

export default Header;
