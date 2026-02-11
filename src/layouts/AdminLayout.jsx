import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config'; 
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Estados de control
  const [allowedModules, setAllowedModules] = useState([]);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(""); 

  // --- NUEVO ESTADO PARA EL NOMBRE ---
  const [currentUserName, setCurrentUserName] = useState("");
  
  // NUEVOS ESTADOS PARA EL BLOQUEO 404
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // --- EFECTO 1: VERIFICAR ROL Y PERMISOS ---
  useEffect(() => {
    const fetchUserRoleAndPermissions = async () => {
      if (!user) return; 

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let realRole = "cliente";
        let realName = "Usuario"; 

        if (userSnap.exists()) {
            // --- AQUÍ ESTABA EL ERROR ---
            // Faltaba declarar la variable 'userData' (o 'data') antes de usarla
            const userData = userSnap.data(); 
            
            realRole = userData.role || "cliente";
            realName = userData.nombre || "Usuario"; // Ahora sí podemos leer 'nombre'
        }
        
        // Guardamos en los estados para pasarlos al Welcome
        setCurrentUserRole(realRole);
        setCurrentUserName(realName);

        // --- BLOQUEO DE SEGURIDAD (FAKE 404) ---
        if (realRole === 'cliente') {
            setIsUnauthorized(true);
            setCheckingPermissions(false);
            return;
        }

        // --- CARGA DE PERMISOS ---
        if (realRole === 'admin' || realRole === 'superadmin') {
          setAllowedModules(['ALL']); 
          setCheckingPermissions(false);
          return;
        }

        // Roles específicos
        const q = query(collection(db, "roles"), where("nombre", "==", realRole));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const roleData = querySnapshot.docs[0].data();
          setAllowedModules(roleData.permissions || []);
        } else {
          setAllowedModules([]);
        }

      } catch (error) {
        console.error("Error verificando permisos:", error);
        setIsUnauthorized(true);
      } finally {
        setCheckingPermissions(false);
      }
    };

    fetchUserRoleAndPermissions();
  }, [user, navigate]);


  // --- EFECTO 2: CUENTA REGRESIVA Y REDIRECCIÓN (SOLO SI NO AUTORIZADO) ---
  useEffect(() => {
    let interval;
    let timeout;

    if (isUnauthorized) {
        // 1. Restar 1 al contador cada segundo
        interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // 2. Redirigir después de 5 segundos exactos
        timeout = setTimeout(() => {
            navigate('/');
        }, 5000);
    }

    // Limpieza al desmontar
    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, [isUnauthorized, navigate]);


  // --- HELPERS ---
  const canAccess = (moduleId) => {
    if (allowedModules.includes('ALL')) return true; 
    return allowedModules.includes(moduleId);
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (error) { console.error(error); }
  };

  // --- RENDERIZADO ---

  // 1. Spinner de carga inicial
  if (checkingPermissions) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-bold">Verificando credenciales...</p>
        </div>
    );
  }

  // 2. PANTALLA FAKE 404 (SEGURIDAD)
  if (isUnauthorized) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
            <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Página no encontrada</h2>
            <p className="text-gray-500 mt-2 max-w-md">
                Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            
            <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">
                    <i className="fas fa-circle-notch fa-spin mr-2 text-blue-500"></i>
                    Redirigiendo al inicio en <span className="font-bold text-blue-600 text-lg">{countdown}</span> segundos...
                </p>
            </div>
            
            <button 
                onClick={() => navigate('/')}
                className="mt-6 text-blue-600 hover:underline text-sm"
            >
                Ir al Inicio inmediatamente
            </button>
        </div>
    );
  }

  // 3. LAYOUT DEL ADMIN (SOLO SI PASÓ FILTROS)
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl sticky top-0 h-screen">
        <div className="p-6 text-2xl font-bold text-center border-b border-gray-800 tracking-wide">
          Admin Panel
          <span className="block text-xs font-normal text-orange-500 mt-1 uppercase tracking-widest">
            {currentUserRole}
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {canAccess('dashboard') && (
             <Link to="/admin/dashboard" className="block py-3 px-4 ..."> {/* <--- CAMBIO AQUÍ */}
                <i className="fas fa-chart-line mr-3 w-5 text-center"></i> Dashboard
             </Link>
          )}

          {canAccess('pedidos') && (
             <Link to="/admin/pedidos" className="block py-3 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white">
                 <i className="fas fa-shopping-bag mr-3 w-5 text-center"></i> Pedidos
             </Link>
          )}

          {canAccess('productos') && (
            <>
              <Link to="/admin/productos" className="block py-3 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white">
                  <i className="fas fa-box mr-3 w-5 text-center"></i> Productos
              </Link>
              <Link to="/admin/categorias" className="block py-3 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white">
                  <i className="fas fa-tags mr-3 w-5 text-center"></i> Categorías
              </Link>
            </>
          )}

          {canAccess('clientes') && (
              <Link to="/admin/mensajes" className="block py-3 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white">
                  <i className="fas fa-envelope mr-3 w-5 text-center"></i> Mensajes
              </Link>
          )}

          {canAccess('web') && (
            <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase">Web</div>
                <Link to="/admin/home-config" className="block py-2 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white text-sm">
                    <i className="fas fa-home mr-3 w-5 text-center"></i> Portada
                </Link>
                <Link to="/admin/publicaciones" className="block py-2 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white text-sm">
                    <i className="fas fa-newspaper mr-3 w-5 text-center"></i> Publicaciones
                </Link>
                <Link to="/admin/info-empresa" className="block py-2 px-4 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white text-sm">
                    <i className="fas fa-building mr-3 w-5 text-center"></i> Info Empresa
                </Link>
            </>
          )}

          {canAccess('roles') && (
            <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase">Sistema</div>
                <Link to="/admin/roles" className="block py-2 px-4 rounded hover:bg-gray-800 transition text-orange-400 hover:text-orange-300 text-sm font-bold">
                    <i className="fas fa-user-shield mr-3 w-5 text-center"></i> Roles y Permisos
                </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <div className="text-sm font-bold truncate text-white">{user?.nombre || "Admin"}</div>
                    <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                </div>
            </div>
            
            <button 
                onClick={handleLogout}
                className="w-full bg-red-600/90 hover:bg-red-600 text-white py-2 rounded transition flex items-center justify-center gap-2 text-sm font-bold"
            >
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet context={{ role: currentUserRole, nombre: currentUserName }} />
      </main>
    </div>
  );
};

export default AdminLayout;