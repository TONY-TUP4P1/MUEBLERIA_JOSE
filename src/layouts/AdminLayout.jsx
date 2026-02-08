import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Importamos el hook

const AdminLayout = () => {
  const { logout, user } = useAuth(); // <--- Usamos la función logout
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        await logout();
        navigate('/login'); // Nos manda al login al salir
    } catch (error) {
        console.error("Error al salir", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold text-center border-b border-gray-800">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block py-2.5 px-4 rounded hover:bg-gray-800 transition">
              <i className="fas fa-chart-line mr-2"></i> Dashboard
          </Link>
          <Link to="/admin/productos" className="block py-2.5 px-4 rounded hover:bg-gray-800 transition">
              <i className="fas fa-box mr-2"></i> Productos
          </Link>
          <Link to="/admin/pedidos" className="block py-2.5 px-4 rounded hover:bg-gray-800 transition">
              <i className="fas fa-shopping-bag mr-2"></i> Pedidos
          </Link>
          <Link to="/admin/categorias" className="block py-2.5 px-4 rounded hover:bg-gray-800 transition">
              <i className="fas fa-tags mr-2"></i> Categorías
          </Link>
        </nav>

        {/* Sección de Usuario abajo */}
        <div className="p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400 mb-2">Usuario:</div>
            <div className="text-sm font-bold truncate mb-4">{user?.email}</div>
            
            <button 
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition flex items-center justify-center gap-2"
            >
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;