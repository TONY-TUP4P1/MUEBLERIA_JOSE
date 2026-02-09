import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar Productos para contar y revisar stock
        const prodSnap = await getDocs(collection(db, "muebles")); // o "products"
        const products = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // 2. Filtrar los que tienen Stock 0 o negativo
        const outOfStock = products.filter(p => !p.stock || p.stock <= 0);
        setLowStockProducts(outOfStock);

        // 3. Contar Pedidos (Opcional, si tienes la colección orders)
        const orderSnap = await getDocs(collection(db, "orders"));

        setStats({
            products: prodSnap.size,
            orders: orderSnap.size,
            users: 5 // Dato simulado o real si tienes usuarios
        });

      } catch (error) {
        console.error("Error Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando estadísticas...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Control</h1>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 font-bold mb-2">Total Productos</h3>
            <p className="text-4xl font-extrabold text-blue-600">{stats.products}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 font-bold mb-2">Pedidos Totales</h3>
            <p className="text-4xl font-extrabold text-green-600">{stats.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 font-bold mb-2">Usuarios</h3>
            <p className="text-4xl font-extrabold text-purple-600">{stats.users}</p>
        </div>
      </div>

      {/* SECCIÓN DE ALERTAS DE STOCK */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-red-50 flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            <h2 className="text-xl font-bold text-red-700">Alertas de Stock Agotado</h2>
        </div>

        <div className="p-0">
            {lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-green-600">
                    <i className="fas fa-check-circle text-4xl mb-3"></i>
                    <p className="font-bold">¡Todo en orden! No hay productos agotados.</p>
                </div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                        <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4 text-center">Stock Actual</th>
                            <th className="p-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lowStockProducts.map(product => (
                            <tr key={product.id} className="hover:bg-red-50 transition">
                                <td className="p-4 font-bold text-gray-800">{product.nombre}</td>
                                <td className="p-4 text-sm text-gray-500">{product.categoria}</td>
                                <td className="p-4 text-center font-bold text-red-600 text-lg">
                                    {product.stock || 0}
                                </td>
                                <td className="p-4">
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                        AGOTADO
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;