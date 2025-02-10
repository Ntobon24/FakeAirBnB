import app from "../../firebase/firebaseConfig";
import { getAuth , onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
const auth =  getAuth(app)



const AuthContext = createContext();//CREAMOS EL CONTEXTO QUE VA A CONTENER LA INFORMACION DEL USUARIO 

export const AuthProvider = ({ children }) =>{
    const [usuario, setUsuario] = useState(null);

    useEffect( () =>{
       const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {  // FUNCION QUE ESCUCHA SI EL USUARIO ESTA AUTENTICADO O NO
        setUsuario(usuarioFirebase);
       });
       return() => unsubscribe(); // FUNCION QUE DEJA DE ESCUCHAR SI EL USUARIO ESTA AUTENTICADO O NO 



    },[]); //se ejecuta solo una vez
    
    const logout = async()=>{ // FUNCION QUE CIERRA LA SESION
        try {
            await signOut(auth);// espera a que se cierre la sesion antes de continuar
            console.log("Sesion cerrada ");
        } catch (error) {
            console.error("Error al cerrar sesion:", error);
            
        }
    };

    return(//provider va a compartir la informacion del usuario y la funcion logout
        <AuthContext.Provider value={{usuario, logout}}> 
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); //useContext es un hook que nos permite acceder a la informacion del usuario y la funcion logout

