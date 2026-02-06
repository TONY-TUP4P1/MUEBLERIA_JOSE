import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importamos los Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Importamos las Páginas (Asegúrate de tener estos archivos creados con algo básico dentro)
import Home from './pages/client/Home';
import Dashboard from './pages/admin/Dashboard';
import Catalog from './components/client/Catalog';

// Puedes crear este archivo rápido si no existe para probar
// import Catalog from './pages/client/Catalog'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* GRUPO 1: RUTAS DEL CLIENTE (Tienda) */}
        {/* Todas estas rutas tendrán el Navbar blanco y el Footer */}
        <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="catalogo" element={<Catalog />} /> 
            {/* <Route path="carrito" element={<CartPage />} /> */}
        </Route>

        {/* GRUPO 2: RUTAS DEL ADMIN (Panel) */}
        {/* Todas estas rutas tendrán la barra lateral oscura */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            {/* <Route path="productos" element={<AdminProducts />} /> */}
        </Route>

        {/* RUTA 404 (Opcional: Si escriben cualquier otra cosa) */}
        <Route path="*" element={<h1 className="text-center mt-10">404 - Página no encontrada</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;