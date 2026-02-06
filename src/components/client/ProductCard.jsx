import React from 'react';
import { Link } from 'react-router-dom';
import { fixImageURL, formatPrice } from '../../utils/images'; // Importamos nuestros trucos

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
      
      {/* IMAGEN DEL PRODUCTO */}
      {/* 1. ENVOLVEMOS LA IMAGEN EN UN LINK */}
      <Link to={`/producto/${product.id}`} className="relative h-64 overflow-hidden group block">
        <img 
          src={fixImageURL(product.imagen)} 
          alt={product.nombre}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded uppercase tracking-wide">
            {product.categoria || 'Mueble'}
        </span>
      </Link>

      {/* INFORMACIÓN */}
      <div className="p-4 flex-1 flex flex-col">
        {/* 2. ENVOLVEMOS EL TÍTULO EN UN LINK */}
        <Link to={`/producto/${product.id}`}>
            <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight hover:text-orange-600 transition-colors">
                {product.nombre}
            </h3>
        </Link>
        
        {/* Descripción corta (truncada) */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
            {product.descripcion}
        </p>
        
        {/* PRECIO Y BOTÓN */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400">Precio</span>
                <span className="text-xl font-bold text-orange-600">
                    {formatPrice(product.precio)}
                </span>
            </div>
            
            <button 
                className="bg-gray-900 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                onClick={() => alert(`Agregaste ${product.nombre} al carrito (Pronto funcionará real)`)}
            >
                <i className="fas fa-cart-plus"></i> Agregar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;