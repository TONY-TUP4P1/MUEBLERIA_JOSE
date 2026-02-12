import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const MisPedidos = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      // Validamos que exista usuario
      if (!user || !user.email) {
        console.log("Usuario no autenticado o sin email");
        setLoading(false);
        return;
      }

      console.log("Buscando pedidos para:", user.email);

      try {
        const ordersRef = collection(db, "orders");
        
        // --- CONSULTA ---
        // 1. Filtramos por el email que está DENTRO del objeto cliente
        // NOTA: He quitado el orderBy("fecha") temporalmente para evitar errores de índice.
        // Si esto funciona, el problema era el índice de Firebase.
        const q = query(
            ordersRef, 
            where("cliente.email", "==", user.email)
        );

        const querySnapshot = await getDocs(q);
        
        console.log("Pedidos encontrados:", querySnapshot.size); // Muestra cuántos encontró en consola

        const docs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // --- ORDENAMIENTO EN JAVASCRIPT ---
        // Ordenamos aquí para no obligarte a crear índices en Firebase todavía
        // (Orden descendente: el más nuevo primero)
        docs.sort((a, b) => {
            const dateA = a.fecha?.seconds || 0;
            const dateB = b.fecha?.seconds || 0;
            return dateB - dateA; 
        });

        setPedidos(docs);

      } catch (error) {
        console.error("Error cargando pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  // Función auxiliar para formatear precio (si la tienes en utils úsala, si no, esta sirve)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <i className="fas fa-box-open text-orange-600"></i> Mis Pedidos
      </h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <i className="fas fa-shopping-basket text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500 mb-6">No encontramos pedidos asociados al correo: <br/> <b>{user?.email}</b></p>
            <Link to="/catalogo" className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition">
                Ir al Catálogo
            </Link>
        </div>
      ) : (
        <div className="space-y-6">
            {pedidos.map(pedido => (
                <div key={pedido.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    
                    {/* Encabezado del Pedido */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pedido</p>
                            <p className="font-mono font-bold text-gray-800 text-lg">#{pedido.id.slice(0, 8)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fecha</p>
                            <p className="text-sm font-medium text-gray-700">
                                {pedido.fecha?.seconds 
                                    ? new Date(pedido.fecha.seconds * 1000).toLocaleDateString() 
                                    : 'Sin fecha'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Estado</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                pedido.estado === 'entregado' ? 'bg-green-100 text-green-700' :
                                pedido.estado === 'enviado' ? 'bg-blue-100 text-blue-700' :
                                pedido.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {pedido.estado || 'Pendiente'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                            <p className="text-xl font-bold text-orange-600">
                                {pedido.total ? formatPrice(pedido.total) : '$0.00'}
                            </p>
                        </div>
                    </div>

                    {/* Lista de Productos del Pedido */}
                    <div className="p-6">
                        <div className="space-y-3">
                            {/* Verificamos si existe 'productos' o 'items' según como lo guardaste */}
                            {(pedido.productos || pedido.items || []).map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                            {item.cantidad}x
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {item.nombre || "Producto sin nombre"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-medium text-gray-600">
                                        {/* Precio unitario * cantidad */}
                                        {item.precio ? formatPrice(item.precio * item.cantidad) : '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Footer del pedido */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between text-sm text-gray-500 gap-2">
                            <span>Dirección: <span className="font-medium text-gray-700">{pedido.cliente?.direccion || "No especificada"}</span></span>
                            <span>Pago: <span className="font-medium text-gray-700">{pedido.metodoPago || "No especificado"}</span></span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;