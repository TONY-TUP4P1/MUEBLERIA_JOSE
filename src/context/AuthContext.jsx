import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Registro
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 2. Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 3. Logout
  const logout = () => {
    return signOut(auth);
  };

  // 4. Escuchar cambios de sesión (CRUCIAL)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("👤 AuthContext detectó usuario:", currentUser?.email || "Sin sesión");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Cargando aplicación...</div>;
  }

  return (
    <AuthContext.Provider value={{ signup, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};