import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import Modal from "./Modal";
import Register from "./Register";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const auth = getAuth(app);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { usuario, logout } = useAuth();
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validacion de campos vacíos
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
      }

    // Guardar tiempo de inicio
    const startTime = performance.now();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowModalLogin(false);
      console.log("Usuario logueado:", usuario?.email);

      const end = performance.now(); // Marca de fin
      const latency = end - startTime;

      console.log(`Tiempo de autenticación: ${latency.toFixed(2)} ms`);

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="formu-login">
      {usuario ? (
        <div className="bienvenida">
          <h5 className="titulo-bienvenida">Bienvenido, {usuario?.email}</h5>
          <button className="ver-reservas" onClick={() => navigate("/historial-reservas")}>
            Ver mis reservas
          </button>
          <button className="cerrar-sesion" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <button className="user-options" onClick={() => setShowModalLogin(true)}>
          Iniciar Sesión
        </button>
      )}

      {showModalLogin && (
        <Modal show={showModalLogin} onClose={() => setShowModalLogin(false)}>
          <form className="formu" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Ingresar Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Ingresar Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-danger">{error}</p>}
            <button className="boton-enviar" type="submit">
              Continuar
            </button>

            <button
              className="boton-registro"
              onClick={(e) => {
                e.preventDefault();
                setShowRegister(true);
                setShowModalLogin(false);
              }}
            >
              Crear cuenta nueva
            </button>
          </form>
        </Modal>
      )}

      {showRegister && (
        <Modal show={showRegister} onClose={() => setShowRegister(false)}>
          <Register onClose={() => setShowRegister(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Login;
