import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fixImageURL } from '../../utils/images';

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Lista de Slides
  const [slides, setSlides] = useState([]);
  
  // Estado para el formulario de edición
  const [editingIndex, setEditingIndex] = useState(-1); // -1 = Nuevo Slide
  const [formSlide, setFormSlide] = useState({
    titulo: '',
    subtitulo: '',
    imagen: '',
    botonTexto: 'Ver Catálogo',
    botonLink: '/catalogo'
  });

  // 1. Cargar Configuración
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "content", "home");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().slides) {
          setSlides(docSnap.data().slides);
        } else {
          // Si no hay slides, iniciamos vacío
          setSlides([]);
        }
      } catch (error) {
        console.error("Error cargando:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // 2. Manejar Inputs del Formulario
  const handleChange = (e) => {
    setFormSlide({ ...formSlide, [e.target.name]: e.target.value });
  };

  // 3. Agregar o Actualizar Slide en la lista LOCAL
  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    
    if (!formSlide.imagen) return alert("La imagen es obligatoria");

    let newSlides = [...slides];
    if (editingIndex >= 0) {
        // Editar existente
        newSlides[editingIndex] = formSlide;
    } else {
        // Crear nuevo
        newSlides.push(formSlide);
    }
    
    setSlides(newSlides);
    // Resetear formulario
    setFormSlide({ titulo: '', subtitulo: '', imagen: '', botonTexto: 'Ver más', botonLink: '/catalogo' });
    setEditingIndex(-1);
  };

  // 4. Editar uno existente (Cargar en form)
  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormSlide(slides[index]);
  };

  // 5. Borrar Slide
  const handleDelete = (index) => {
    if (confirm("¿Eliminar este slide?")) {
        const newSlides = slides.filter((_, i) => i !== index);
        setSlides(newSlides);
        if (editingIndex === index) {
            setEditingIndex(-1);
            setFormSlide({ titulo: '', subtitulo: '', imagen: '', botonTexto: '', botonLink: '' });
        }
    }
  };

  // 6. GUARDAR TODO EN FIREBASE
  const handleSaveToFirebase = async () => {
    setSaving(true);
    try {
        await setDoc(doc(db, "content", "home"), { slides }, { merge: true });
        alert("¡Carrusel actualizado correctamente!");
    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error al guardar.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Carrusel</h1>
        <button 
            onClick={handleSaveToFirebase}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
        >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Guardar Cambios en la Web
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-4">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">
                {editingIndex >= 0 ? '✏️ Editando Slide' : '➕ Nuevo Slide'}
            </h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                    <input name="titulo" value={formSlide.titulo} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Ej: Oferta de Verano" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Subtítulo</label>
                    <textarea name="subtitulo" value={formSlide.subtitulo} onChange={handleChange} className="w-full border p-2 rounded h-20 resize-none" placeholder="Descripción corta..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">URL Imagen</label>
                    <input name="imagen" value={formSlide.imagen} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Texto Botón</label>
                        <input name="botonTexto" value={formSlide.botonTexto} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Enlace</label>
                        <select name="botonLink" value={formSlide.botonLink} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                            <option value="/catalogo">Catálogo</option>
                            <option value="/contacto">Contacto</option>
                            {/* Puedes agregar más rutas aquí si creas más páginas */}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    {editingIndex >= 0 && (
                        <button 
                            type="button"
                            onClick={() => { setEditingIndex(-1); setFormSlide({ titulo: '', subtitulo: '', imagen: '', botonTexto: 'Ver más', botonLink: '/catalogo' }); }}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold"
                        >
                            Cancelar
                        </button>
                    )}
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                        {editingIndex >= 0 ? 'Actualizar' : 'Agregar a la Lista'}
                    </button>
                </div>
            </form>
        </div>

        {/* === COLUMNA DERECHA: LISTA DE SLIDES === */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-500 mb-4">Slides Activos ({slides.length})</h2>
            
            {slides.length === 0 && (
                <div className="text-center p-10 bg-gray-50 border-2 border-dashed rounded-xl text-gray-400">
                    No hay slides. ¡Agrega el primero!
                </div>
            )}

            {slides.map((slide, index) => (
                <div key={index} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-40 hover:shadow-md transition">
                    {/* Imagen Preview */}
                    <div className="w-full md:w-48 bg-gray-100 relative">
                        <img src={fixImageURL(slide.imagen)} alt="Slide" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-gray-800">{slide.titulo || '(Sin Título)'}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{slide.subtitulo}</p>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                            <i className="fas fa-link"></i> {slide.botonLink} ({slide.botonTexto})
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex md:flex-col border-t md:border-t-0 md:border-l border-gray-100 divide-x md:divide-x-0 md:divide-y divide-gray-100">
                        <button 
                            onClick={() => handleEdit(index)}
                            className="flex-1 px-4 py-3 bg-white hover:bg-blue-50 text-blue-600 transition flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-edit"></i> <span className="md:hidden">Editar</span>
                        </button>
                        <button 
                            onClick={() => handleDelete(index)}
                            className="flex-1 px-4 py-3 bg-white hover:bg-red-50 text-red-500 transition flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-trash"></i> <span className="md:hidden">Borrar</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default AdminHome;