import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para controlar inputs de subcategorías
  const [subInputs, setSubInputs] = useState({}); 

  // 1. Cargar categorías
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const catsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        subcategorias: [], // Por si no tiene el campo aún
        ...doc.data() 
      }));
      setCategories(catsData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Crear Categoría Principal (PADRE)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "categories"), { 
        nombre: newCategory.trim(),
        subcategorias: [] // Array vacío inicial
      });
      setCategories([...categories, { id: docRef.id, nombre: newCategory.trim(), subcategorias: [] }]);
      setNewCategory('');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 3. Borrar Categoría Principal
  const handleDeleteCategory = async (id) => {
    if (confirm("¿Borrar esta categoría completa y sus subcategorías?")) {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  // 4. Agregar Subcategoría (HIJO)
  const handleAddSub = async (catId, subName) => {
    if (!subName || !subName.trim()) return;
    
    try {
      const categoryRef = doc(db, "categories", catId);
      await updateDoc(categoryRef, {
        subcategorias: arrayUnion(subName.trim())
      });

      // Actualizar estado local visualmente
      const updatedCats = categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, subcategorias: [...cat.subcategorias, subName.trim()] };
        }
        return cat;
      });
      setCategories(updatedCats);
      setSubInputs({ ...subInputs, [catId]: '' }); // Limpiar input específico
    } catch (error) {
      console.error("Error agregando sub:", error);
    }
  };

  // 5. Borrar Subcategoría
  const handleDeleteSub = async (catId, subName) => {
    if (confirm(`¿Borrar subcategoría "${subName}"?`)) {
      const categoryRef = doc(db, "categories", catId);
      await updateDoc(categoryRef, {
        subcategorias: arrayRemove(subName)
      });

      const updatedCats = categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, subcategorias: cat.subcategorias.filter(s => s !== subName) };
        }
        return cat;
      });
      setCategories(updatedCats);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestionar Estructura</h1>

      {/* CREAR PADRE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold mb-4">1. Crear Categoría Principal</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input 
            type="text" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ej: Dormitorio, Sala, Cocina..."
            className="flex-1 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
            Crear Padre
          </button>
        </form>
      </div>

      {/* LISTA DE CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            
            {/* Cabecera de la Categoría */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-xl text-gray-800">{cat.nombre}</h3>
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700">
                <i className="fas fa-trash"></i>
              </button>
            </div>

            {/* Lista de Subcategorías */}
            <div className="mb-4 space-y-2">
              {cat.subcategorias && cat.subcategorias.length > 0 ? (
                cat.subcategorias.map((sub, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                    <span>{sub}</span>
                    <button onClick={() => handleDeleteSub(cat.id, sub)} className="text-gray-400 hover:text-red-500">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Sin subcategorías</p>
              )}
            </div>

            {/* Input para agregar Subcategoría */}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Nueva subcategoría..."
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                value={subInputs[cat.id] || ''}
                onChange={(e) => setSubInputs({...subInputs, [cat.id]: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSub(cat.id, subInputs[cat.id])}
              />
              <button 
                onClick={() => handleAddSub(cat.id, subInputs[cat.id])}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;