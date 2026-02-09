import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts y Páginas
import ClientLayout from './layouts/ClientLayout';
import Home from './pages/client/Home';
import Catalog from './pages/client/Catalog';
import ProductDetail from './pages/client/ProductDetail';
import CartPage from './pages/client/CartPage';
import Checkout from './pages/client/Checkout';
import Contact from './pages/client/Contact';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard'; // (Si la creaste, sino usa AdminProducts como index)
import AdminProducts from './pages/admin/AdminProducts';
import Login from './pages/admin/Login'; // <--- IMPORTAR LOGIN
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminHome from './pages/admin/AdminHome';
import AdminPublications from './pages/admin/AdminPublications';
import AdminAbout from './pages/admin/AdminAbout';

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
          <Route path="checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />
        </Route>

        {/* RUTAS DEL ADMIN (Protegidas) 🔒 */}
        {/* Envolvemos todo el layout de Admin con ProtectedRoute */}
        <Route element={<ProtectedRoute />}> 
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} /> {/* O AdminProducts si prefieres */}
                <Route path="productos" element={<AdminProducts />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="home-config" element={<AdminHome />} />
                <Route path="publicaciones" element={<AdminPublications />} />
                <Route path="info-empresa" element={<AdminAbout />} />
            </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;