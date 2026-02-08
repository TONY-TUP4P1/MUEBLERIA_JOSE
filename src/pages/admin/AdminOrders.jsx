import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { formatPrice } from '../../utils/images';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Leer los pedidos de Firebase
  const fetchOrders = async () => {
    setLoading(true);
    try {
        // Ordenamos por fecha (el más nuevo primero)
        const q = query(collection(db, "orders"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(docs);
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Función para cambiar el estado (ej: de "pendiente" a "entregado")
  const handleStatusChange = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { estado: newStatus });
        
        // Actualizamos la lista localmente para que se vea el cambio rápido
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, estado: newStatus } : order
        ));
        alert("Estado actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("No se pudo actualizar el estado");
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando pedidos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Pedidos</h1>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 font-semibold text-gray-600">ID / Fecha</th>
                    <th className="p-4 font-semibold text-gray-600">Cliente</th>
                    <th className="p-4 font-semibold text-gray-600">Productos</th>
                    <th className="p-4 font-semibold text-gray-600">Total</th>
                    <th className="p-4 font-semibold text-gray-600">Estado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                        
                        {/* ID y Fecha */}
                        <td className="p-4 align-top">
                            <div className="font-mono text-xs text-gray-500">#{order.id.slice(0,6)}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {order.fecha?.toDate().toLocaleDateString()}
                            </div>
                        </td>

                        {/* Datos Cliente */}
                        <td className="p-4 align-top">
                            <div className="font-bold">{order.cliente.nombre}</div>
                            <div className="text-xs text-gray-500">{order.cliente.telefono}</div>
                            <div className="text-xs text-gray-400 italic mt-1">{order.cliente.direccion}</div>
                        </td>

                        {/* Lista de Productos */}
                        <td className="p-4 align-top">
                            <ul className="space-y-1">
                                {order.productos.map((prod, index) => (
                                    <li key={index} className="text-xs">
                                        <span className="font-bold text-gray-700">{prod.cantidad}x</span> {prod.nombre}
                                    </li>
                                ))}
                            </ul>
                        </td>

                        {/* Total */}
                        <td className="p-4 align-top font-bold text-gray-800">
                            {formatPrice(order.total)}
                        </td>

                        {/* Selector de Estado */}
                        <td className="p-4 align-top">
                            <select 
                                value={order.estado}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`border rounded p-1 text-xs font-bold uppercase
                                    ${order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : ''}
                                    ${order.estado === 'enviado' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                                    ${order.estado === 'entregado' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                                    ${order.estado === 'cancelado' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                                `}
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="enviado">Enviado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay pedidos registrados aún.</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;