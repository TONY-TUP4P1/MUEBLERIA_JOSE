import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de la ruta correcta
import { useCart } from '../../context/CartContext'; // Importamos el contexto del carrito

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart(); // Obtenemos el carrito
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Calcular total de items para la burbuja roja
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  // Función buscar
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?q=${searchTerm}`);
      setSearchTerm(""); 
    }
  };

  const handleLogout = async () => {
    try {
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

            {/* MENÚ DE NAVEGACIÓN */}
            <div className="flex items-center gap-6">
                <Link to="/" className="text-gray-600 hover:text-orange-600 font-bold transition">
                    Inicio
                </Link>
                <Link to="/catalogo" className="text-gray-600 hover:text-orange-600 font-bold transition">
                    Catálogo
                </Link>
                <Link to="/contacto" className="text-gray-600 hover:text-orange-600 font-bold transition">
                    Nosotros
                </Link>
                
                {/* ICONO DEL CARRITO */}
                <Link to="/carrito" className="relative group p-2">
                    <i className="fas fa-shopping-bag text-2xl text-gray-600 group-hover:text-orange-600 transition"></i>
                    
                    {/* Burbuja de notificación */}
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-sm">
                            {totalItems}
                        </span>
                    )}
                </Link>

                {/* USUARIO O LOGIN */}
                <div className="border-l pl-6 ml-2 border-gray-200">
                    {user ? (
                        <div className="flex items-center gap-3 group relative cursor-pointer">
                            {/* Avatar con inicial */}
                            <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                            </div>
                            
                            {/* Nombre (oculto en móvil muy pequeño) */}
                            <div className="hidden lg:block">
                                <p className="text-xs text-gray-500 font-bold">Hola,</p>
                                <p className="text-sm font-bold text-gray-800 max-w-[100px] truncate">
                                    {user.displayName || user.email.split('@')[0]}
                                </p>
                            </div>

                            {/* Dropdown simple para salir */}
                            <button 
                                onClick={handleLogout}
                                className="ml-2 text-gray-400 hover:text-red-600 transition"
                                title="Cerrar Sesión"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
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

      {/* BUSCADOR MOVIL (Debajo del navbar en pantallas pequeñas) */}
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