import React, { useState, useEffect } from 'react';
import { fixImageURL } from '../../utils/images';

const ProductForm = ({ productToEdit, onSave, onCancel }) => {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Sillas', // Valor por defecto
    imagen: '',
    descripcion: ''
  });

  // Si nos pasan un producto para editar, llenamos el formulario
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertimos precio a número antes de guardar
    onSave({ ...formData, precio: parseFloat(formData.precio) });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {productToEdit ? 'Editar Mueble' : 'Nuevo Mueble'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              required
              name="nombre"
              value={formData.nombre} 
              onChange={handleChange}
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
            <input 
              required
              name="precio"
              value={formData.precio} 
              onChange={handleChange}
              type="number" 
              step="0.01"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select 
              name="categoria" 
              value={formData.categoria} 
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white"
            >
              <option value="Sillas">Sillas</option>
              <option value="Mesas">Mesas</option>
              <option value="Sofás">Sofás</option>
              <option value="Escritorios">Escritorios</option>
            </select>
          </div>

          {/* Imagen (Link) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace de Imagen</label>
            <input 
              required
              name="imagen"
              value={formData.imagen} 
              onChange={handleChange}
              type="url" 
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            name="descripcion"
            value={formData.descripcion} 
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>

        {/* Previsualización de Imagen */}
        {formData.imagen && (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
             <img src={fixImageURL(formData.imagen)} alt="Vista previa" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3 justify-end pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            {productToEdit ? 'Actualizar' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;