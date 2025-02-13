import { Link } from "react-router-dom";
import "./header.css";
import Login from "../../pages/RegistroInicio/Login";

const Header = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">FakeAirbnb</Link>
      <Login />
    </header>
  );
};

export default Header;
