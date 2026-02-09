import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Mueblería<span className="text-orange-600">Jose</span>
        </Link>

        {/* MENÚ DE NAVEGACIÓN */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium">
              Inicio
          </Link>
          <Link to="/catalogo" className="text-gray-600 hover:text-orange-600 font-medium">
              Catálogo
          </Link>
          <Link to="/contacto" className="text-gray-600 hover:text-blue-600 font-bold transition">
              Nosotros
          </Link>
          
          {/* ICONO DEL CARRITO */}
          <Link to="/carrito" className="relative group">
            <div className="p-2 text-gray-600 group-hover:text-orange-600 transition">
               <i className="fas fa-shopping-bag text-2xl"></i>
            </div>
            
            {/* Lógica de la burbuja: Solo se muestra si hay items */}
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* USUARIO (Simulado) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              J
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">Jose Galves</span>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;