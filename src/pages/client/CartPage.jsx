import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fixImageURL, formatPrice } from '../../utils/images';

const CartPage = () => {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <i className="fas fa-shopping-basket text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Parece que aún no has añadido muebles.</p>
        <Link to="/catalogo" className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold">
            Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTA DE PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                  <img src={fixImageURL(item.imagen)} alt={item.nombre} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.nombre}</h3>
                  <p className="text-orange-600 font-bold">{formatPrice(item.precio)}</p>
                  <div className="text-sm text-gray-500 mt-1">Cantidad: {item.quantity}</div>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                title="Eliminar"
              >
                  <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-500 underline mt-4">
              Vaciar carrito
          </button>
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-bold mb-4">Resumen</h3>
            <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
                <span>Envío</span>
                <span>Gratis</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-bold border-t pt-4">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(totalPrice)}</span>
            </div>
            
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition shadow-lg">
                Proceder al Pago
            </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;