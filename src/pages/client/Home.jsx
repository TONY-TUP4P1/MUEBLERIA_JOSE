import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Importamos la conexión

const Home = () => {
  // Estado para verificar si carga
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const obtenerMuebles = async () => {
      try {
        // Hacemos la consulta a la colección "muebles"
        const querySnapshot = await getDocs(collection(db, "muebles"));
        const lista = querySnapshot.docs.map(doc => ({
           id: doc.id, 
           ...doc.data() 
        }));
        
        console.log("🔥 CONEXIÓN EXITOSA! Muebles encontrados:", lista);
        setProductos(lista);
      } catch (error) {
        console.error("❌ Error conectando a Firebase:", error);
      }
    };

    obtenerMuebles();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Prueba de Conexión</h1>
      
      {productos.length === 0 ? (
        <p>Cargando datos de Firebase...</p>
      ) : (
        <div>
           <p className="text-green-600 font-bold mb-4">¡Conectado! Se encontraron {productos.length} muebles.</p>
           {/* Mostramos una lista rápida solo para probar */}
           <ul>
             {productos.map(p => (
               <li key={p.id} className="mb-2">
                 {p.nombre} - S/ {p.precio}
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

export default Home;