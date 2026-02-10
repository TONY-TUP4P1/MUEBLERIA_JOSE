import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/images';
import ProductModal from '../../components/client/ProductModal';
import { useSearchParams } from 'react-router-dom'; // <--- 1. IMPORTANTE: Agregado para leer la URL

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // === ESTADOS DE FILTRO AVANZADO ===
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesData, setCategoriesData] = useState([]); 
  
  // Guardamos qué categoría padre está activa y cuál subcategoría
  const [activeCategory, setActiveCategory] = useState('Todos'); 
  const [activeSubcategory, setActiveSubcategory] = useState(null); 

  // === HOOK PARA LEER URL (CONEXIÓN CON NAVBAR) ===
  const [searchParams] = useSearchParams();

  // 1. Efecto para Cargar Datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar Estructura de Categorías
        const catsSnapshot = await getDocs(collection(db, "categories"));
        const catsStructure = catsSnapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre,
            subcategorias: doc.data().subcategorias || []
        }));
        setCategoriesData(catsStructure);

        // Cargar Muebles
        const prodsSnapshot = await getDocs(collection(db, "muebles"));
        const prodsList = prodsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(prodsList);

      } catch (error) {
        console.error("Error cargando:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Efecto para Sincronizar URL con el Buscador (NUEVO)
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
        setSearchTerm(query); // Pone el texto de la URL en el buscador
        setActiveCategory('Todos'); // Resetea categorías para buscar en todo
    }
  }, [searchParams]);

  // === LÓGICA DE FILTRADO ===
  const filteredProducts = products.filter(product => {
    // Validar que tenga STOCK POSITIVO
    const hasStock = product.stock && product.stock > 0;

    const prodCat = product.categoria ? product.categoria.trim() : 'Otros';
    const prodSub = product.subcategoria ? product.subcategoria.trim() : '';
    
    // Búsqueda segura (maneja nulos)
    const term = searchTerm.toLowerCase();
    const matchSearch = product.nombre ? product.nombre.toLowerCase().includes(term) : false;
    
    let matchCat = true;
    if (activeCategory !== 'Todos') matchCat = prodCat === activeCategory;

    let matchSub = true;
    if (activeCategory !== 'Todos' && activeSubcategory) matchSub = prodSub === activeSubcategory;

    return matchSearch && matchCat && matchSub && hasStock; 
  });

  // Funciones navegación Modal
  const navigateModal = (direction) => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    let newIndex;
    if (direction === 'next') newIndex = (currentIndex + 1) % filteredProducts.length;
    else newIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setSelectedProduct(filteredProducts[newIndex]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando catálogo...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Nuestro Catálogo</h1>
        <p className="text-gray-500">
            {searchTerm ? `Resultados para: "${searchTerm}"` : 'Muebles diseñados para tu hogar.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* === SIDEBAR CATEGORÍAS === */}
        <aside className="w-full lg:w-1/4 space-y-6">
            
          {/* Buscador Local */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition"
            />
          </div>

          {/* Árbol de Categorías */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Filtrar por</h3>
            
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => { setActiveCategory('Todos'); setActiveSubcategory(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition
                    ${activeCategory === 'Todos' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Ver Todo
                </button>
              </li>

              {categoriesData.map((cat) => (
                <li key={cat.id} className="mt-2">
                    <button 
                        onClick={() => {
                            if (activeCategory === cat.nombre) {
                                setActiveSubcategory(null);
                            } else {
                                setActiveCategory(cat.nombre);
                                setActiveSubcategory(null);
                            }
                        }}
                        className={`w-full flex justify-between items-center px-3 py-2 rounded-lg transition
                            ${activeCategory === cat.nombre ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <span>{cat.nombre}</span>
                        {cat.subcategorias.length > 0 && (
                            <i className={`fas fa-chevron-down text-xs transition-transform ${activeCategory === cat.nombre ? 'rotate-180' : ''}`}></i>
                        )}
                    </button>

                    {activeCategory === cat.nombre && cat.subcategorias.length > 0 && (
                        <ul className="pl-6 mt-1 space-y-1 border-l-2 border-gray-100 ml-3">
                            {cat.subcategorias.map((sub) => (
                                <li key={sub}>
                                    <button 
                                        onClick={() => setActiveSubcategory(sub)}
                                        className={`text-sm w-full text-left px-2 py-1 rounded transition
                                            ${activeSubcategory === sub ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {sub}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* === GRILLA === */}
        <main className="w-full lg:w-3/4">
            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">No encontramos productos con esos filtros.</p>
                    <button onClick={() => {setSearchTerm(''); setActiveCategory('Todos');}} className="mt-4 text-blue-600 font-bold hover:underline">Limpiar filtros</button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                             <button onClick={() => setSelectedProduct(product)} className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition">
                                <i className="fas fa-eye mr-2"></i> Ver Detalle
                             </button>
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex gap-2 mb-1">
                            <span className="text-xs text-gray-400 font-bold uppercase">{product.categoria}</span>
                            {product.subcategoria && (
                                <span className="text-xs text-blue-400 font-bold uppercase">• {product.subcategoria}</span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">{product.nombre}</h2>
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="text-xl font-bold text-gray-900">{formatPrice(product.precio)}</span>
                            <button onClick={() => addToCart(product)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white transition flex items-center justify-center shadow-sm">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </main>
      </div>

      {selectedProduct && (
        <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onNext={() => navigateModal('next')} 
            onPrev={() => navigateModal('prev')} 
            hasNext={filteredProducts.length > 1} 
        />
      )}
    </div>
  );
};

export default Catalog;