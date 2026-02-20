import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { formatPrice } from '../../utils/images';
import * as XLSX from 'xlsx';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NUEVO: Estado para controlar qué boleta se está viendo
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 1. Leer los pedidos de Firebase
  const fetchOrders = async () => {
    setLoading(true);
    try {
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

  // 2. Función para cambiar el estado
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { estado: newStatus });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, estado: newStatus } : order
      ));
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  // NUEVO: 3. Descargar Reporte Excel
  const handleDownloadReport = () => {
    if (orders.length === 0) return alert("No hay pedidos para exportar.");

    // Preparamos los datos planos para el Excel
    const dataForExcel = orders.map(o => ({
      "ID Pedido": o.id,
      "Fecha": o.fecha?.toDate().toLocaleDateString() || "N/A",
      "Cliente": o.cliente.nombre,
      "Teléfono": o.cliente.telefono,
      "Dirección": o.cliente.direccion,
      "Cant. Productos": o.productos.reduce((acc, p) => acc + p.cantidad, 0),
      "Total Pagado": o.total,
      "Estado": o.estado.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    XLSX.writeFile(workbook, "Reporte_Ventas.xlsx");
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i> Cargando pedidos...</div>;

  return (
    <div className="p-6">
      
      {/* CABECERA Y BOTÓN DE EXCEL */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <button 
          onClick={handleDownloadReport}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-semibold shadow-sm"
        >
          <i className="fas fa-file-excel"></i> Descargar Reporte
        </button>
      </div>
      
      {/* TABLA DE PEDIDOS */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 print:hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID / Fecha</th>
              <th className="p-4 font-semibold text-gray-600">Cliente</th>
              <th className="p-4 font-semibold text-gray-600">Productos</th>
              <th className="p-4 font-semibold text-gray-600">Total</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="p-4 align-top">
                  <div className="font-mono text-xs text-gray-500">#{order.id.slice(0,8)}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {order.fecha?.toDate().toLocaleDateString()}
                  </div>
                </td>

                <td className="p-4 align-top">
                  <div className="font-bold">{order.cliente.nombre}</div>
                  <div className="text-xs text-gray-500">{order.cliente.telefono}</div>
                  <div className="text-xs text-gray-400 italic mt-1">{order.cliente.direccion}</div>
                </td>

                <td className="p-4 align-top">
                  <ul className="space-y-1">
                    {order.productos.map((prod, index) => (
                      <li key={index} className="text-xs">
                        <span className="font-bold text-gray-700">{prod.cantidad}x</span> {prod.nombre}
                      </li>
                    ))}
                  </ul>
                </td>

                <td className="p-4 align-top font-bold text-gray-800">
                  {formatPrice(order.total)}
                </td>

                <td className="p-4 align-top">
                  <select 
                    value={order.estado}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`border rounded p-1 text-xs font-bold uppercase cursor-pointer outline-none
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

                {/* NUEVO: BOTÓN VER BOLETA */}
                <td className="p-4 align-top text-center">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition text-xs font-bold border border-gray-300 flex items-center gap-2 mx-auto"
                  >
                    <i className="fas fa-receipt"></i> Ver Boleta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No hay pedidos registrados aún.</div>
        )}
      </div>

      {/* NUEVO: MODAL DE LA BOLETA */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 print:bg-transparent print:p-0">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full">
            
            {/* Cabecera Boleta */}
            <div className="bg-gray-50 p-6 text-center border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest mb-1">BOLETA DE VENTA</h2>
              <p className="text-sm text-gray-500">Pedido #{selectedOrder.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Fecha: {selectedOrder.fecha?.toDate().toLocaleDateString()} - {selectedOrder.fecha?.toDate().toLocaleTimeString()}
              </p>
            </div>

            {/* Datos del Cliente */}
            <div className="p-6 border-b border-gray-100 text-sm">
              <h3 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Datos del Cliente</h3>
              <p><span className="font-semibold">Nombre:</span> {selectedOrder.cliente.nombre}</p>
              <p><span className="font-semibold">Teléfono:</span> {selectedOrder.cliente.telefono}</p>
              <p><span className="font-semibold">Dirección:</span> {selectedOrder.cliente.direccion}</p>
            </div>

            {/* Lista de Productos (Ticket Style) */}
            <div className="p-6 text-sm">
              <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Detalle de Compra</h3>
              <table className="w-full text-left mb-4">
                <thead>
                  <tr className="border-b border-dashed border-gray-300 text-gray-500 text-xs">
                    <th className="pb-2 font-normal">Cant</th>
                    <th className="pb-2 font-normal">Descripción</th>
                    <th className="pb-2 font-normal text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-100">
                  {selectedOrder.productos.map((prod, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-gray-600">{prod.cantidad}</td>
                      <td className="py-2 text-gray-800">{prod.nombre}</td>
                      <td className="py-2 text-right text-gray-800">{formatPrice(prod.precio * prod.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Boleta */}
              <div className="border-t-2 border-gray-800 pt-3 flex justify-between items-center mt-2">
                <span className="font-bold text-lg text-gray-800">TOTAL PAGADO</span>
                <span className="font-bold text-xl text-emerald-600">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Botones de Acción Modal (Se ocultan al imprimir) */}
            <div className="bg-gray-50 p-4 flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition"
              >
                Cerrar
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <i className="fas fa-print"></i> Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;