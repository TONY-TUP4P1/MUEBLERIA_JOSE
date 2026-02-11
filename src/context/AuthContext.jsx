import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, // <--- IMPORTANTE: Importar esto
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. FUNCIÓN DE REGISTRO (SIGNUP) ---
  const signup = (email, password) => {
    // Esta función devuelve una promesa que Register.jsx va a esperar
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // --- 2. FUNCIÓN DE LOGIN ---
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // --- 3. FUNCIÓN DE LOGOUT ---
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Estado de usuario cambiado:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
        signup,  // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba exportar esto
        login, 
        logout, 
        user, 
        loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};