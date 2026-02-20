import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login'; // <--- IMPORTAR LOGIN
import Register from './pages/Register';

// Layouts y Páginas
import ClientLayout from './layouts/ClientLayout';
import Home from './pages/client/Home';
import Catalog from './pages/client/Catalog';
import ProductDetail from './pages/client/ProductDetail';
import CartPage from './pages/client/CartPage';
import Checkout from './pages/client/Checkout';
import Contact from './pages/client/Contact';
import MisPedidos from './pages/client/MisPedidos'; // Importar
import Perfil from './pages/client/Perfil';       // Importar
import Ayuda from './pages/client/Ayuda';         // Importar
import Chatbot from './pages/client/Chatbot';

import AdminLayout from './layouts/AdminLayout';
import Welcome from './pages/admin/Welcome'; 
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminHome from './pages/admin/AdminHome';
import AdminPublications from './pages/admin/AdminPublications';
import AdminAbout from './pages/admin/AdminAbout';
import AdminMessages from './pages/admin/AdminMessages';
import RolesPage from './pages/admin/RolesPage';

// Componente de Seguridad
import ProtectedRoute from './components/admin/ProtectedRoute'; // <--- IMPORTAR GUARDIA

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* RUTA DE LOGIN (Pública) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <--- NUEVA RUTA */}

        {/* RUTAS DEL CLIENTE (Públicas) */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="carrito" element={<CartPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path='/Chatbot' element={<Chatbot/>} />
        </Route>

        {/* RUTAS DEL ADMIN (Protegidas) 🔒 */}
        {/* Envolvemos todo el layout de Admin con ProtectedRoute */}
        <Route element={<ProtectedRoute />}> 
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Welcome />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="productos" element={<AdminProducts />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="home-config" element={<AdminHome />} />
                <Route path="publicaciones" element={<AdminPublications />} />
                <Route path="info-empresa" element={<AdminAbout />} />
                <Route path="mensajes" element={<AdminMessages />} />
                <Route path="/admin/roles" element={<RolesPage />} />
                
            </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;