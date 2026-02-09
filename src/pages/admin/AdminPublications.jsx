import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { fixImageURL } from '../../utils/images';

const AdminPublications = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'novedad', // novedad, oferta, temporada
    imagen: '',
    contenido: '',
    botonTexto: '',
    botonLink: ''
  });

  // 1. Cargar Publicaciones
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "publications"), orderBy("titulo", "asc")); // Podrías ordenar por fecha si añades timestamp
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(docs);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Manejar Formulario
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Editar
        await updateDoc(doc(db, "publications", editingId), formData);
      } else {
        // Crear
        await addDoc(collection(db, "publications"), {
            ...formData,
            fecha: new Date().toISOString() // Guardamos fecha de creación
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchPosts(); // Recargar lista
      alert("Publicación guardada");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Borrar esta publicación?")) {
      await deleteDoc(doc(db, "publications", id));
      fetchPosts();
    }
  };

  const openEdit = (post) => {
    setFormData(post);
    setEditingId(post.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ titulo: '', tipo: 'novedad', imagen: '', contenido: '', botonTexto: '', botonLink: '' });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Publicaciones</h1>
        <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
            + Nueva Publicación
        </button>
      </div>

      {/* LISTA DE POSTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                <div className="h-40 overflow-hidden relative">
                    <img src={fixImageURL(post.imagen)} alt={post.titulo} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold uppercase rounded text-white
                        ${post.tipo === 'oferta' ? 'bg-red-500' : post.tipo === 'temporada' ? 'bg-purple-500' : 'bg-blue-500'}
                    `}>
                        {post.tipo}
                    </span>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{post.titulo}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.contenido}</p>
                    <div className="flex gap-2">
                        <button onClick={() => openEdit(post)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded text-sm font-bold">Editar</button>
                        <button onClick={() => handleDelete(post.id)} className="px-3 bg-red-100 text-red-600 hover:bg-red-200 rounded"><i className="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">{editingId ? 'Editar Publicación' : 'Nueva Publicación'}</h2>
                    <button onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Título</label>
                            <input required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Tipo</label>
                            <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full border p-2 rounded bg-white">
                                <option value="novedad">Novedad</option>
                                <option value="oferta">Oferta</option>
                                <option value="temporada">Temporada</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Imagen URL</label>
                        <input value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})} className="w-full border p-2 rounded" placeholder="https://..." />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700">Contenido</label>
                        <textarea required value={formData.contenido} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-full border p-2 rounded h-24" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700">Texto Botón (Opcional)</label>
                            <input value={formData.botonTexto} onChange={(e) => setFormData({...formData, botonTexto: e.target.value})} className="w-full border p-2 rounded" placeholder="Ej: Ver Oferta" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Link Botón</label>
                            <input value={formData.botonLink} onChange={(e) => setFormData({...formData, botonLink: e.target.value})} className="w-full border p-2 rounded" placeholder="/catalogo" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4">
                        Guardar Publicación
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublications;