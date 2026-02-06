import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProductCard from '../../components/client/ProductCard';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Descargar productos al cargar la página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "muebles"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
        {/* TÍTULO Y FILTROS (Visual por ahora) */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Nuestro Catálogo</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Descubre nuestra selección exclusiva de muebles diseñados para transformar tu espacio.
            </p>
        </div>

        {/* ESTADO DE CARGA */}
        {loading ? (
            <div className="text-center py-20">
                <i className="fas fa-circle-notch fa-spin text-4xl text-orange-500"></i>
                <p className="mt-4 text-gray-500">Cargando muebles...</p>
            </div>
        ) : (
            /* GRILLA DE PRODUCTOS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.length > 0 ? (
                    products.map((mueble) => (
                        <ProductCard key={mueble.id} product={mueble} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay productos disponibles por el momento.</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Catalog;