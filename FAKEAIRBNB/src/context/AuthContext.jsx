import app from "../firebase/firebaseConfig";
import { getAuth , onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useEffect, useState , useContext, useMemo } from "react";

const auth =  getAuth(app);

const AuthContext = createContext(); //CREAMOS EL CONTEXTO QUE VA A CONTENER LA INFORMACION DEL USUARIO 

export const AuthProvider = ({ children }) =>{
    const [usuario, setUsuario] = useState(null);

    useEffect(() =>{
       const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {  
           setUsuario(usuarioFirebase);
       });
       return () => unsubscribe(); 
    },[]);

    const logout = async () => { 
        try {
            console.log("AuthContext Provider - Usuario:", usuario);
            await signOut(auth);
            console.log("Sesion cerrada ");
        } catch (error) {
            console.error("Error al cerrar sesion:", error);
        }
    };

    // useMemo para evitar recrear el objeto en cada render
    const value = useMemo(() => ({
        usuario,
        logout
    }), [usuario]); // solo cambia cuando `usuario` cambia

    return (
        <AuthContext.Provider value={value}> 
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
