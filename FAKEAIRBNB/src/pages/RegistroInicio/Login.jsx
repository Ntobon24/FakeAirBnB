import { useState } from "react";
import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import app from "../../firebase/firebaseConfig";
import {useAuth} from "../../context/AuthContext";
import Modal from "./Modal";
const auth = getAuth(app);
import "./Login.css";

const Login = () => {
    


    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState(null);
    const { usuario, logout } = useAuth();

    const [showModal, setShowModal] = useState(false);

    
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError(null);
        try{

            await signInWithEmailAndPassword(auth, email, password);
            setShowModal(false);
            console.log("Usuario logueado");
            console.log("Usuario autenticado:", usuario.usuario.email);

        }catch(error){
            setError(error.message);
        }
    };

    


    return(
        <div className="formu-login">
            {usuario ? (
            <div className="bienvenida">
                    <p>Bienvenido, {usuario.email} 🎉</p>
                </div>
                ) :  (
                <button className="user-options" onClick={() => setShowModal(true)}>
                    Iniciar Sesión
                </button>
            )}
            
            {showModal && (
                <Modal show={showModal} onClose={() => setShowModal(false)}>
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

                        <button className="boton-registro" >Crear cuenta nueva</button>

                    </form>
                </Modal>
            )}
        </div>
        
    );


};
export default Login;