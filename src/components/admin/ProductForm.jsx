import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase/config';
import { fixImageURL } from '../../utils/images';

const ProductForm = ({ productToEdit, onSave, onCancel }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '', 
    subcategoria: '',
    imagen: '',
    descripcion: ''
  });

  const [categoriesData, setCategoriesData] = useState([]);
  const [availableSubcats, setAvailableSubcats] = useState([]);

  // 1. Bloquear Scroll al abrir el modal (Efecto "Ver Detalle")
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // 2. Cargar Categorías y Subcategorías
  useEffect(() => {
    const fetchCats = async () => {
        try {
            const snap = await getDocs(collection(db, "categories"));
            const data = snap.docs.map(d => ({ nombre: d.data().nombre, sub: d.data().subcategorias || [] }));
            setCategoriesData(data);
        } catch (error) { console.error(error); }
    };
    fetchCats();
  }, []);

  // 3. Cargar datos si estamos editando
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    }
  }, [productToEdit]);

  // 4. Filtrar subcategorías dinámicamente
  useEffect(() => {
    const selectedCatObj = categoriesData.find(c => c.nombre === formData.categoria);
    if (selectedCatObj) {
        setAvailableSubcats(selectedCatObj.sub);
    } else {
        setAvailableSubcats([]);
    }
  }, [formData.categoria, categoriesData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoria') {
        setFormData(prev => ({ ...prev, categoria: value, subcategoria: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, precio: parseFloat(formData.precio) });
  };

  return (
    // FONDO MODAL (Backdrop Blur)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      
      {/* CONTENEDOR DEL FORMULARIO */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* ENCABEZADO */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">
                {productToEdit ? '✏️ Editar Mueble' : '✨ Nuevo Mueble'}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition">
                <i className="fas fa-times text-xl"></i>
            </button>
        </div>

        {/* CUERPO DEL FORMULARIO (Scrollable si es muy alto) */}
        <div className="p-8 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* FILA 1: Nombre y Precio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Producto</label>
                        <input 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleChange} 
                            placeholder="Ej: Sofá Chesterfield"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Precio (S/)</label>
                        <input 
                            name="precio" 
                            type="number" 
                            value={formData.precio} 
                            onChange={handleChange} 
                            placeholder="0.00"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            required 
                        />
                    </div>
                </div>

                {/* FILA 2: Categorías Dinámicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categoría Principal</label>
                        <select 
                            name="categoria" 
                            value={formData.categoria} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {categoriesData.map((c, i) => (
                                <option key={i} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subcategoría</label>
                        <select 
                            name="subcategoria" 
                            value={formData.subcategoria} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={!formData.categoria || availableSubcats.length === 0}
                        >
                            <option value="">{availableSubcats.length === 0 ? '---' : 'Seleccionar...'}</option>
                            {availableSubcats.map((sub, i) => (
                                <option key={i} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* FILA 3: IMAGEN Y PREVISUALIZACIÓN (Lo que pediste) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL de la Imagen</label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <input 
                                name="imagen" 
                                value={formData.imagen} 
                                onChange={handleChange} 
                                placeholder="https://..."
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Copia el enlace de la imagen aquí.</p>
                        </div>

                        {/* === PREVISUALIZACIÓN DE IMAGEN === */}
                        {formData.imagen && (
                            <div className="w-30 h-30 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm shrink-0 bg-gray-50">
                                <img 
                                    src={fixImageURL(formData.imagen)} 
                                    alt="Vista previa" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=Error';}} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* FILA 4: Descripción */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada</label>
                    <textarea 
                        name="descripcion" 
                        value={formData.descripcion} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition h-24 resize-none" 
                        placeholder="Describe los materiales, dimensiones y características..."
                    />
                </div>

            </form>
        </div>

        {/* PIE DEL MODAL (BOTONES FIJOS ABAJO) */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
            <button 
                type="button" 
                onClick={onCancel} 
                className="px-6 py-2.5 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSubmit} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transform hover:-translate-y-0.5 transition"
            >
                {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;