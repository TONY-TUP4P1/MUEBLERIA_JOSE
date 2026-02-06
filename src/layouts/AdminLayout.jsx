import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Barra Lateral Izquierda) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
            {/* Usamos Link en lugar de <a href> para no recargar la página */}
            <Link to="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">Dashboard</Link>
            <Link to="/admin/productos" className="block py-2 px-4 hover:bg-gray-700 rounded">Productos</Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <Link to="/" className="text-sm text-gray-400 hover:text-white">← Volver a la Tienda</Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto p-8">
        {/* Aquí se cargarán Dashboard.jsx o AdminProducts.jsx */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;