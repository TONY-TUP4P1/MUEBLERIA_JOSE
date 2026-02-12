import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext'; 
import { useAuth } from '../../context/AuthContext'; // <--- Asegúrate que la ruta sea correcta
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// 1. DEFINIMOS EL FORMATEADOR AQUÍ PARA EVITAR ERRORES DE IMPORTACIÓN
const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

const Checkout = () => {
  // 2. OBTENEMOS LOS CONTEXTOS CON VALORES POR DEFECTO
  const { cart = [], totalPrice = 0, clearCart } = useCart();
  const { user, loading } = useAuth(); 
  
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  
  // Estado del formulario
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: '' 
  });

  // --- DEBUGGING: MIRA LA CONSOLA DEL NAVEGADOR (F12) ---
  console.log("--- DEBUG ---");
  console.log("Loading:", loading);
  console.log("User:", user);
  
  // 3. EFECTO MAGICO: HEREDAR DATOS
  useEffect(() => {
    // Si aún está cargando la sesión, esperamos
    if (loading) return;

    // Si hay usuario, llenamos el email inmediatamente
    if (user && users.email) {
        console.log("Heredando email:", users.email);
        
        // Paso A: Poner email del Auth
        setClientData(prev => ({
            ...prev,
            email: users.email
        }));

        // Paso B: Intentar buscar datos extra en Firestore
        const fetchExtraData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClientData(prev => ({
                        ...prev,
                        nombre: data.nombre || '',
                        telefono: data.telefono || '',
                        direccion: data.direccion || '',
                        // Priorizamos el email de Auth, pero si quieres el de la BD, usa data.email
                    }));
                }
            } catch (error) {
                console.error("Error trayendo datos extra:", error);
            }
        };
        fetchExtraData();
    }
  }, [user, loading]); // Se ejecuta cuando 'user' o 'loading' cambian

  const handleInputChange = (e) => {
    setClientData({
        ...clientData,
        [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);

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
            userId: user ? user.uid : null
        };

        const docRef = await addDoc(collection(db, "orders"), order);
        clearCart();
        alert(`Pedido generado con éxito ID: ${docRef.id}`);
        navigate('/');
    } catch (error) {
        console.error("Error al comprar:", error);
        alert("Hubo un error al procesar el pedido");
    } finally {
        setProcesando(false);
    }
  };

  // 4. RENDERIZADO CONDICIONAL PARA EVITAR PANTALLA BLANCA
  if (loading) {
      return <div className="p-10 text-center font-bold text-gray-500">Cargando sesión...</div>;
  }

  if (!cart.length) {
      return <div className="p-10 text-center">El carrito está vacío. <button onClick={() => navigate('/')}>Volver</button></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
      {/* MENSAJE DE DEBUG VISUAL */}
      {user ? (
          <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
              Hola <b>{users.email}</b>, hemos autocompletado tu correo.
          </div>
      ) : (
          <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 rounded">
              Comprando como invitado (No registrado)
          </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input 
                    type="email" 
                    name="email"
                    value={clientData.email} 
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded bg-gray-50"
                    // Si hay usuario, hacemos que sea de solo lectura para evitar errores
                    readOnly={!!user} 
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Nombre</label>
                <input 
                    type="text" 
                    name="nombre"
                    value={clientData.nombre} 
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Teléfono</label>
                <input 
                    type="tel" 
                    name="telefono"
                    value={clientData.telefono} 
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required 
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Dirección</label>
                <input 
                    type="text" 
                    name="direccion"
                    value={clientData.direccion} 
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required 
                />
            </div>

            <button 
                type="submit" 
                disabled={procesando}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {procesando ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
        </form>

        {/* RESUMEN */}
        <div className="bg-gray-50 p-6 rounded h-fit">
            <h2 className="text-xl font-bold mb-4">Resumen</h2>
            {cart.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b text-sm">
                    <span>{item.quantity} x {item.nombre}</span>
                    <span>{formatPrice(item.precio * item.quantity)}</span>
                </div>
            ))}
            <div className="flex justify-between mt-4 text-xl font-bold">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;