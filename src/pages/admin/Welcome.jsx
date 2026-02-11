import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useOutletContext } from 'react-router-dom'; // Importante

const Welcome = () => {
  const { user } = useAuth(); // Seguimos usando esto para el email o la inicial
  
  // AQUI RECIBIMOS EL NOMBRE REAL QUE NOS PASÓ EL LAYOUT
  const { role, nombre } = useOutletContext(); 

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActual = date.toLocaleDateString('es-ES', options);
  const horaActual = date.toLocaleTimeString('es-ES');

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-10 shadow-sm animate-fade-in-up">
      
      <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl ring-4 ring-gray-200">
        <span className="text-5xl font-bold text-white">
            {/* Usamos la primera letra del nombre real si existe, sino del email */}
            {nombre ? nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
        </span>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        {/* AQUI MOSTRAMOS EL NOMBRE REAL DE LA BASE DE DATOS */}
        ¡Hola, <span className="text-orange-600">{nombre}</span>!
      </h1>
      
      <div className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm uppercase tracking-wider mb-8 border border-blue-200">
        {role || 'Cargando...'}
      </div>

      <div className="w-24 h-1 bg-gray-300 rounded mb-8"></div>

      <div className="text-center space-y-2">
        <p className="text-gray-500 text-lg capitalize">{fechaActual}</p>
        <p className="text-5xl font-thin text-gray-700 font-mono">{horaActual}</p>
      </div>

      <p className="mt-12 text-gray-400 text-sm max-w-md text-center">
        Selecciona una opción del menú lateral para comenzar a trabajar.
        Recuerda cerrar sesión al terminar tu turno.
      </p>

    </div>
  );
};

export default Welcome;