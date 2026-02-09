import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { fixImageURL } from '../../utils/images';

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  // 1. Cargar Datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar Slides
        const docRef = doc(db, "content", "home");
        const docSnap = await getDoc(docRef);

        // 3. Cargar Publicaciones
        const postsSnapshot = await getDocs(collection(db, "publications"));
        setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        if (docSnap.exists() && docSnap.data().slides && docSnap.data().slides.length > 0) {
          setSlides(docSnap.data().slides);
        } else {
            // Fallback por defecto si no hay nada configurado
            setSlides([{
                titulo: 'Bienvenido a Muebles v1',
                subtitulo: 'Configura este banner desde el Admin',
                imagen: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
                botonTexto: 'Ir al Catálogo',
                botonLink: '/catalogo'
            }]);
        }

        // Cargar Productos Destacados
        const productsRef = collection(db, "muebles");
        const q = query(productsRef, limit(3));
        const querySnapshot = await getDocs(q);
        setFeaturedProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error Home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Auto-Play del Carrusel (cada 5 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
        setSlides(prevSlides => {
             if (prevSlides.length === 0) return [];
             // Calculamos el siguiente slide
             setCurrentSlide(prev => (prev + 1) % prevSlides.length);
             return prevSlides; 
        });
    }, 10000); // <--- ¡AQUÍ! Cambia 5000 por 10000 (10 segundos)

    return () => clearInterval(timer);
  }, []);
  

  // Funciones de navegación manual
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Cargando...</div></div>;

  return (
    <div className="font-sans">
      
      {/* === HERO CAROUSEL === */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-gray-900">
        
        {slides.map((slide, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
                {/* Imagen Fondo */}
                <div className="absolute inset-0">
                    <img 
                        src={fixImageURL(slide.imagen)} 
                        alt={slide.titulo} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                </div>

                {/* Contenido Texto */}
                <div className="relative z-20 h-full flex items-center max-w-7xl mx-auto px-6">
                    <div className="max-w-2xl animate-fadeInUp">
                        <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider mb-4 rounded-sm">
                            Destacado
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                            {slide.titulo}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
                            {slide.subtitulo}
                        </p>
                        
                        {slide.botonTexto && (
                            <Link 
                                to={slide.botonLink || '/catalogo'} 
                                className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all shadow-xl hover:scale-105 transform"
                            >
                                {slide.botonTexto}
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        ))}

        {/* FLECHAS NAVEGACIÓN (Solo si hay más de 1 slide) */}
        {slides.length > 1 && (
            <>
                {/* BOTÓN IZQUIERDO */}
                <button 
                    onClick={prevSlide}
                    className="absolute left-0 top-0 bottom-0 w-20 z-30 flex items-center justify-center 
                              text-white/50 hover:text-white hover:bg-black/10 transition-all duration-300
                              opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                    <i className="fas fa-chevron-left text-4xl drop-shadow-lg transform group-hover:-translate-x-1 transition-transform"></i>
                </button>

                {/* BOTÓN DERECHO */}
                <button 
                    onClick={nextSlide}
                    className="absolute right-0 top-0 bottom-0 w-20 z-30 flex items-center justify-center 
                              text-white/50 hover:text-white hover:bg-black/10 transition-all duration-300
                              opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                    <i className="fas fa-chevron-right text-4xl drop-shadow-lg transform group-hover:translate-x-1 transition-transform"></i>
                </button>
            </>
        )}

        {/* INDICADORES (PUNTITOS) */}
        {slides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {slides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white'}`}
                    ></button>
                ))}
            </div>
        )}
      </section>

      {/* === SECCIÓN DE PRODUCTOS RECIENTES === */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Recién Agregados</h2>
                    <div className="h-1 w-20 bg-yellow-400 rounded-full"></div>
                </div>
                <Link to="/catalogo" className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition">
                    Ver todo <i className="fas fa-arrow-right"></i>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group flex flex-col h-full">
                        <div className="h-64 overflow-hidden relative bg-gray-100">
                             <img src={fixImageURL(product.imagen)} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl mb-2 text-gray-800">{product.nombre}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.descripcion}</p>
                            <Link to="/catalogo" className="w-full block text-center bg-gray-100 hover:bg-gray-900 hover:text-white py-3 rounded-lg font-bold transition">
                                Ver Detalles
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* === SECCIÓN DE NOTICIAS Y OFERTAS === */}
      {posts.length > 0 && (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Novedades y Ofertas</h2>
                    <p className="text-gray-500">Entérate de lo último en nuestra tienda</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100">
                            
                            {/* Imagen */}
                            <div className="h-56 overflow-hidden relative">
                                <img 
                                    src={fixImageURL(post.imagen)} 
                                    alt={post.titulo} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                />
                                {/* Etiqueta de Tipo */}
                                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded shadow-md
                                    ${post.tipo === 'oferta' ? 'bg-red-600' : ''}
                                    ${post.tipo === 'novedad' ? 'bg-blue-600' : ''}
                                    ${post.tipo === 'temporada' ? 'bg-purple-600' : ''}
                                `}>
                                    {post.tipo}
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition">
                                    {post.titulo}
                                </h3>
                                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                                    {post.contenido}
                                </p>
                                
                                {post.botonTexto && (
                                    <Link 
                                        to={post.botonLink || '/catalogo'}
                                        className="inline-block border-b-2 border-gray-900 pb-1 font-bold text-gray-900 hover:text-blue-600 hover:border-blue-600 transition"
                                    >
                                        {post.botonTexto} <i className="fas fa-arrow-right ml-1 text-xs"></i>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

    </div>
  );
};

export default Home;