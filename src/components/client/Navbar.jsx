import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart(); // Usamos el cálculo directo del Context
  const navigate = useNavigate();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // Para saber si mostramos botón Admin

  // Referencia para cerrar menú al hacer clic fuera (opcional pero recomendado)
  const menuRef = useRef(null);

  // 1. EFECTO: Obtener el rol del usuario para el menú
  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role);
          }
        } catch (error) {
          console.error("Error obteniendo rol:", error);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchRole();
  }, [user]);

  // 2. EFECTO: Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?q=${searchTerm}`);
      setSearchTerm(""); 
    }
  };

  const handleLogout = async () => {
    try {
        setIsMenuOpen(false); // Cerramos menú
        await logout();
        navigate('/');
    } catch (error) {
        console.error("Error al salir", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
        
            {/* LOGO */}
            <Link to="/" className="text-2xl font-extrabold text-gray-800 tracking-tight">
                Mueblería<span className="text-orange-600">Jose</span>
            </Link>

            {/* BUSCADOR (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                <input 
                    type="text"
                    placeholder="Buscar muebles..." 
                    className="w-full border border-gray-300 rounded-full py-2.5 px-4 pl-10 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute left-3 top-3 text-gray-400 hover:text-orange-600 transition">
                    <i className="fas fa-search"></i>
                </button>
            </form>

            {/* MENÚ DE NAVEGACIÓN DERECHO */}
            <div className="flex items-center gap-6">
                <Link to="/" className="text-gray-600 hover:text-orange-600 font-bold transition hidden sm:block">
                    Inicio
                </Link>
                <Link to="/catalogo" className="text-gray-600 hover:text-orange-600 font-bold transition hidden sm:block">
                    Catálogo
                </Link>
                <Link to="/contacto" className="text-gray-600 hover:text-orange-600 font-bold transition hidden sm:block">
                    Nosotros
                </Link>
                
                {/* ICONO DEL CARRITO */}
                <Link to="/carrito" className="relative group p-2">
                    <i className="fas fa-shopping-bag text-2xl text-gray-600 group-hover:text-orange-600 transition"></i>
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-md border-2 border-white">
                            {totalItems}
                        </span>
                    )}
                </Link>

                {/* ZONA DE USUARIO / LOGIN */}
                <div className="border-l pl-6 ml-2 border-gray-200 relative" ref={menuRef}>
                    {user ? (
                        // --- ESTE ES EL NUEVO MENÚ DESPLEGABLE ---
                        <div>
                            {/* Botón Trigger */}
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-3 group focus:outline-none"
                            >
                                <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-transparent group-hover:ring-orange-200 transition">
                                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-xs text-gray-500 font-bold">Hola,</p>
                                    <p className="text-sm font-bold text-gray-800 max-w-[100px] truncate">
                                        {user.displayName || user.email.split('@')[0]}
                                    </p>
                                </div>
                                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform origin-top-right transition-all animate-fade-in-up z-50">
                                    
                                    {/* Encabezado del menú (Móvil) */}
                                    <div className="px-4 py-3 border-b border-gray-100 lg:hidden">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Conectado como:</p>
                                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                                    </div>

                                    {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE --- */}
                                    {/* En lugar de listar roles, preguntamos: ¿Es algo distinto a cliente? */}
                                    {userRole && userRole !== 'cliente' && (
                                        <>
                                            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                                                    Zona de Staff
                                                </p>
                                                <Link 
                                                    to="/admin" 
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 text-sm text-gray-800 font-bold hover:text-orange-600 transition"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500">
                                                        <i className="fas fa-user-shield"></i>
                                                    </div>
                                                    Panel Administrativo
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 my-1"></div>
                                        </>
                                    )}
                                    {/* ---------------------------------- */}

                                    <div className="py-1">
                                        <Link 
                                            to="/mis-pedidos" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <i className="fas fa-shopping-bag w-8 text-gray-400 group-hover:text-orange-500 transition"></i>
                                            <span className="font-medium group-hover:text-gray-900">Mis Pedidos</span>
                                        </Link>

                                        <Link 
                                            to="/perfil" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <i className="fas fa-user-cog w-8 text-gray-400 group-hover:text-orange-500 transition"></i>
                                            <span className="font-medium group-hover:text-gray-900">Mi Cuenta</span>
                                        </Link>

                                        <Link 
                                            to="/ayuda" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <i className="fas fa-life-ring w-8 text-gray-400 group-hover:text-orange-500 transition"></i>
                                            <span className="font-medium group-hover:text-gray-900">Ayuda y Soporte</span>
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition font-bold"
                                    >
                                        <i className="fas fa-sign-out-alt w-8"></i> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-md hover:shadow-lg">
                            Ingresar
                        </Link>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* BUSCADOR MOVIL */}
      <div className="md:hidden px-4 pb-4 bg-white border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <input 
                type="text"
                placeholder="Buscar..." 
                className="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 bg-gray-50 focus:outline-none focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                <i className="fas fa-search"></i>
            </button>
          </form>
      </div>
    </nav>
  );
};

export default Navbar;