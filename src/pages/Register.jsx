import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // --- LÓGICA DE FUERZA DE CONTRASEÑA ---
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;

    // 1. Longitud mínima
    if (password.length > 5) score += 40;
    // 2. Contiene números
    if (/\d/.test(password)) score += 20;
    // 3. Contiene mayúsculas
    if (/[A-Z]/.test(password)) score += 20;
    // 4. Contiene caracteres especiales (!@#$...)
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    return Math.min(100, score);
  };

  const strength = calculateStrength(formData.password);

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';      // Débil
    if (strength < 80) return 'bg-yellow-500';   // Media
    return 'bg-green-500';                       // Fuerte
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength < 40) return 'Débil';
    if (strength < 80) return 'Media';
    return 'Fuerte';
  };
  // --------------------------------------

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { nombre, email, password, confirmPassword } = formData;

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo válido.');
      return false;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const infoUsuario = await signup(formData.email.trim(), formData.password);
      const uid = infoUsuario.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid: uid,
        email: formData.email.trim(),
        nombre: formData.nombre.trim(),
        role: "cliente", 
        createdAt: new Date()
      });

      navigate('/'); 

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil.');
      } else {
        setError('Error al registrarse. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h1>
        
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="juan@email.com"
            />
          </div>

          {/* --- INPUT DE PASSWORD CON BARRA DE FUERZA --- */}
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mínimo 6 caracteres"
            />
            
            {/* Barra de progreso visual */}
            {formData.password && (
                <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Seguridad:</span>
                        <span className={`font-bold ${
                            strength < 40 ? 'text-red-500' : strength < 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {getStrengthLabel()} ({strength}%)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`} 
                            style={{ width: `${strength}%` }}
                        ></div>
                    </div>
                    {/* Tips para mejorar */}
                    {strength < 80 && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            Usa mayúsculas, números y símbolos para mejorar.
                        </p>
                    )}
                </div>
            )}
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg focus:ring-2 outline-none transition ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? 'border-red-300 focus:ring-red-200 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Repite tu contraseña"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-3 rounded-lg text-white transition flex justify-center items-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        
        <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia Sesión</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;