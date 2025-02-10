import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebase/firebaseConfig";

const auth = getAuth(app);
const Register = () => {
    const[email, setEmail] = useState("");
    const[contraseña, setContraseña] = useState("");
    const[errror, setError] = useState(null);
    



};