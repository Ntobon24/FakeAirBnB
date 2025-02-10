import { useState } from "react";
import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import app from "../../firebase/firebaseConfig";
import {useAuth} from "../../context/AuthContext";
import Modal from "./Modal";
const auth = getAuth(app);
import Register from "./Register";
import "./Login.css";

const Login = () => {
    
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState(null);
    const { usuario, logout } = useAuth();

    const [showModalLogin, setShowModalLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);


    
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError(null);
        try{

            await signInWithEmailAndPassword(auth, email, password);
            setShowModalLogin(false);
            console.log("Usuario logueado");
            console.log("Usuario autenticado:", usuario?.email);

        }catch(error){
            setError(error.message);
        }
    };

    


    return(
        <div className="formu-login">
            {usuario ? (
            <div className="bienvenida">
                    <h5 className="titulo-bienvenida">Bienvenido, {usuario?.email} </h5>
                    <button className="cerrar-sesion" onClick={logout}>Cerrar Sesión</button>
            </div>
                ) :  (
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
                        <button className="boton-enviar" type="submit">Continua</button>

                        <button className="boton-registro" onClick={(e) => {
                            e.preventDefault()
                            setShowRegister(true);
                            setShowModalLogin(false); 
                        }} >
                            Crear cuenta nueva</button>
                            

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