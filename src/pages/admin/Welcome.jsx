import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useOutletContext, Link } from 'react-router-dom'; // Agregamos Link

const Welcome = () => {
  const { user } = useAuth();
  
  // 1. AQUI RECIBIMOS 'canAccess' ADEMÁS DEL ROL Y NOMBRE
  const { role, nombre, canAccess } = useOutletContext(); 

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaActual = date.toLocaleDateString('es-ES', options);
  const horaActual = date.toLocaleTimeString('es-ES');

  // 2. DEFINIMOS LOS BOTONES (Igual que en el Sidebar)
  const shortcuts = [
    { 
      id: 'pedidos', 
      title: 'Pedidos', 
      icon: 'fa-shopping-bag', 
      link: '/admin/pedidos', 
      color: 'bg-blue-500',
      desc: 'Gestionar ventas'
    },
    { 
      id: 'productos', 
      title: 'Inventario', 
      icon: 'fa-box', 
      link: '/admin/productos', 
      color: 'bg-emerald-500',
      desc: 'Productos y Categorías'
    },
    { 
      id: 'clientes', 
      title: 'Mensajes', 
      icon: 'fa-envelope', 
      link: '/admin/mensajes', 
      color: 'bg-purple-500',
      desc: 'Buzón de clientes'
    },
    { 
      id: 'web', 
      title: 'Sitio Web', 
      icon: 'fa-desktop', 
      link: '/admin/home-config', 
      color: 'bg-orange-500',
      desc: 'Configurar portada'
    },
    { 
      id: 'roles', 
      title: 'Usuarios', 
      icon: 'fa-user-shield', 
      link: '/admin/roles', 
      color: 'bg-gray-700',
      desc: 'Roles y Permisos'
    },
  ];

  return (
    // Cambiamos 'h-full' por 'min-h-full' y quitamos 'justify-center' para que fluya hacia abajo
    <div className="min-h-full flex flex-col items-center bg-gray-50/50 p-8 animate-fade-in-up">
      
      {/* --- SECCIÓN 1: TU TARJETA DE BIENVENIDA ORIGINAL --- */}
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-gray-100">
            <span className="text-4xl font-bold text-white">
                {nombre ? nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            ¡Hola, <span className="text-orange-600">{nombre}</span>!
          </h1>
          
          <div className="px-4 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider mb-6 border border-blue-100">
            {role || 'Cargando...'}
          </div>

          <div className="w-full h-px bg-gray-100 mb-6"></div>

          <div className="text-center space-y-1">
            <p className="text-gray-500 text-base capitalize">{fechaActual}</p>
            <p className="text-4xl font-light text-gray-700 font-mono tracking-tight">{horaActual}</p>
          </div>
      </div>

      {/* --- SECCIÓN 2: BOTONES DE ACCESO RÁPIDO (NUEVO) --- */}
      <div className="w-full max-w-6xl">
        <h3 className="text-lg font-bold text-gray-700 mb-6 px-2 border-l-4 border-orange-500">
            Accesos Rápidos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortcuts.map((item) => {
                // FILTRO DE SEGURIDAD: Si no tiene permiso, no mostramos el botón
                if (!canAccess(item.id)) return null;

                return (
                    <Link 
                        key={item.id} 
                        to={item.link}
                        className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-200 hover:border-orange-200 transition-all duration-300 flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 rounded-lg ${item.color} bg-opacity-10 text-${item.color.split('-')[1]}-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                            <i className={`fas ${item.icon}`}></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                                {item.desc}
                            </p>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>

    </div>
  );
};

export default Welcome;