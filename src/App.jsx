import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts y Páginas
import ClientLayout from './layouts/ClientLayout';
import Home from './pages/client/Home';
import Catalog from './components/client/Catalog';
import ProductDetail from './pages/client/ProductDetail';
import CartPage from './pages/client/CartPage';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard'; // (Si la creaste, sino usa AdminProducts como index)
import AdminProducts from './pages/admin/AdminProducts';
import Login from './pages/admin/Login'; // <--- IMPORTAR LOGIN

// Componente de Seguridad
import ProtectedRoute from './components/admin/ProtectedRoute'; // <--- IMPORTAR GUARDIA

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* RUTA DE LOGIN (Pública) */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS DEL CLIENTE (Públicas) */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="carrito" element={<CartPage />} />
        </Route>

        {/* RUTAS DEL ADMIN (Protegidas) 🔒 */}
        {/* Envolvemos todo el layout de Admin con ProtectedRoute */}
        <Route element={<ProtectedRoute />}> 
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} /> {/* O AdminProducts si prefieres */}
                <Route path="productos" element={<AdminProducts />} />
            </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;