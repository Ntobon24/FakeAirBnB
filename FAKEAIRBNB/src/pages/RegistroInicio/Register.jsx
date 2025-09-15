import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../../firebase/firebaseConfig";
import {useAuth} from "../../context/AuthContext";
const auth = getAuth(app);

const Register = ({ onClose }) => {
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[error, setError] = useState(null);
    const { usuario, logout } = useAuth();


    const handleSubmit = async(e) =>{
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Por favor completa todos los campos");
            return; 
        }
        try {
            await createUserWithEmailAndPassword(auth,email,password)
            console.log("Usuario registrado");
            console.log("Usuario autenticado:", usuario?.email);
            onClose();
            
        } catch (error) {
            setError(error.message);
            
        }



    };

    return(
        <div className="formu-register">
            
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
                        <button className="boton-enviar" type="submit">Registrate</button>


                    </form>
          
        </div>
        
    );


        
        
        


};
export default Register;