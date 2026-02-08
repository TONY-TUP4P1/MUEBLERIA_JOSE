import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/images';
import { useAuth } from '../../context/AuthContext'; // <--- 1. IMPORTAR ESTO

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth(); // <--- 2. OBTENER USUARIO LOGUEADO
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Datos del cliente (Formulario)
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: '' // Este es el email de contacto que escribe manual
  });

  const handleInputChange = (e) => {
    setClientData({
        ...clientData,
        [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const order = {
            cliente: clientData,
            productos: cart.map(item => ({
                id: item.id,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.quantity
            })),
            total: totalPrice,
            fecha: serverTimestamp(),
            estado: 'pendiente',
            // 3. ETIQUETADO MAGICO 🏷️
            // Si hay usuario logueado, guardamos su ID. Si no, va null (compra de invitado).
            userId: user ? user.uid : null, 
            userEmail: user ? user.email : clientData.email 
        };

        // Guardamos en la colección PRINCIPAL para que el Admin lo vea
        const docRef = await addDoc(collection(db, "orders"), order);
        const orderId = docRef.id;

        // ... (El resto del código de WhatsApp sigue igual)
        
        const mensaje = `Hola, quiero confirmar mi pedido #${orderId.slice(0,5)}...`; // (Resumido)
        const numeroWhatsApp = "51999999999"; 
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

        clearCart();
        window.open(urlWhatsApp, '_blank');
        navigate('/');
        alert(`¡Pedido registrado! ID: ${orderId}`);

    } catch (error) {
        console.error(error);
        alert("Error al procesar el pedido.");
    } finally {
        setLoading(false);
    }
  };

  if (cart.length === 0) return <div className="text-center py-20">No hay productos para comprar.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: FORMULARIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Tus Datos</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
                    <input required name="nombre" onChange={handleInputChange} type="text" className="w-full border p-2 rounded outline-none focus:border-orange-500" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Teléfono / WhatsApp</label>
                    <input required name="telefono" onChange={handleInputChange} type="tel" className="w-full border p-2 rounded outline-none focus:border-orange-500" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Dirección de Entrega</label>
                    <input required name="direccion" onChange={handleInputChange} type="text" className="w-full border p-2 rounded outline-none focus:border-orange-500" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Email (Opcional)</label>
                    <input name="email" onChange={handleInputChange} type="email" className="w-full border p-2 rounded outline-none focus:border-orange-500" />
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 transition flex items-center justify-center gap-2"
                >
                    {loading ? 'Procesando...' : (
                        <>
                            <i className="fab fa-whatsapp text-xl"></i> Confirmar pedido por WhatsApp
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* COLUMNA 2: RESUMEN */}
        <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div className="space-y-3 mb-4">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.nombre}</span>
                        <span className="font-bold">{formatPrice(item.precio * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
                * Al confirmar, se abrirá WhatsApp con los detalles de tu pedido para coordinar el pago.
            </p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;