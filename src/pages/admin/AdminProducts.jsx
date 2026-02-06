import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fixImageURL, formatPrice } from '../../utils/images';
import ProductForm from '../../components/admin/ProductForm';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 1. CARGAR PRODUCTOS
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "muebles"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. ELIMINAR PRODUCTO
  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este mueble? Esta acción no se puede deshacer.")) {
      try {
        await deleteDoc(doc(db, "muebles", id));
        // Actualizamos la lista localmente para no recargar
        setProducts(products.filter(p => p.id !== id));
        alert("Producto eliminado.");
      } catch (error) {
        console.error("Error eliminando:", error);
        alert("Error al eliminar.");
      }
    }
  };

  // 3. GUARDAR (CREAR O EDITAR)
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // MODO EDICIÓN
        const productRef = doc(db, "muebles", editingProduct.id);
        await updateDoc(productRef, productData);
        alert("Producto actualizado correctamente");
      } else {
        // MODO CREACIÓN
        await addDoc(collection(db, "muebles"), productData);
        alert("Producto creado correctamente");
      }
      
      // Resetear todo y recargar lista
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Hubo un error al guardar.");
    }
  };

  // 4. PREPARAR EDICIÓN
  const startEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold shadow-sm"
          >
            <i className="fas fa-plus"></i> Nuevo Mueble
          </button>
        )}
      </div>

      {/* FORMULARIO (Se muestra solo si showForm es true) */}
      {showForm && (
        <ProductForm 
          productToEdit={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando inventario...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Imagen</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="p-3">
                    <img 
                      src={fixImageURL(product.imagen)} 
                      alt="" 
                      className="w-12 h-12 object-cover rounded bg-gray-100" 
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">{product.nombre}</td>
                  <td className="p-3 text-sm text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {product.categoria}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-gray-700">{formatPrice(product.precio)}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button 
                      onClick={() => startEdit(product)}
                      className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center" 
                      title="Editar"
                    >
                      <i className="fas fa-pen text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center" 
                      title="Eliminar"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && products.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No hay productos registrados aún.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;