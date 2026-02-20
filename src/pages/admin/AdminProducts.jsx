import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fixImageURL, formatPrice } from '../../utils/images';
import ProductForm from '../../components/admin/ProductForm';
import * as XLSX from 'xlsx';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Estados para los filtros
  const [deleteCategory, setDeleteCategory] = useState(""); // Para el borrado masivo
  const [viewCategory, setViewCategory] = useState("");     // NUEVO: Para filtrar la tabla visualmente
  
  const fileInputRef = useRef(null);

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

  // 2. ELIMINAR PRODUCTO INDIVIDUAL
  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este mueble? Esta acción no se puede deshacer.")) {
      try {
        await deleteDoc(doc(db, "muebles", id));
        setProducts(products.filter(p => p.id !== id));
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
        const productRef = doc(db, "muebles", editingProduct.id);
        await updateDoc(productRef, productData);
      } else {
        await addDoc(collection(db, "muebles"), productData);
      }
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

  // --- LÓGICA DE CATEGORÍAS Y FILTROS ---

  // Obtenemos categorías únicas (soporta tanto 'categoria' como 'category' por si acaso)
  const uniqueCategories = [...new Set(products.map(p => p.categoria || p.category).filter(Boolean))];

  // NUEVO: Filtramos los productos que se van a mostrar en la tabla
  const displayedProducts = viewCategory 
    ? products.filter(p => (p.categoria || p.category) === viewCategory)
    : products;

  // A. EXPORTAR A EXCEL
  const handleExportExcel = () => {
    if (products.length === 0) return alert("No hay productos para exportar.");
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "inventario_productos.xlsx");
  };

  // B. IMPORTAR DE EXCEL
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) return alert("El archivo Excel está vacío.");

        for (const item of data) {
          const { id, ...productData } = item; 
          await addDoc(collection(db, "muebles"), productData);
        }
        alert(`Se importaron ${data.length} productos correctamente.`);
        fetchProducts();
      } catch (error) {
        console.error("Error importando Excel:", error);
        alert("Error al leer el archivo Excel.");
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  // C. VACIAR PRODUCTOS (BORRADO MASIVO)
  const handleBulkDelete = async () => {
    if (!deleteCategory) {
      alert("Por favor, selecciona una categoría en el selector rojo antes de vaciar.");
      return;
    }

    const message = deleteCategory === "ALL"
      ? "🚨 ATENCIÓN: ¿Estás seguro de vaciar TODOS los productos? Esta acción es irreversible."
      : `¿Estás seguro de eliminar todos los productos de la categoría "${deleteCategory}"?`;

    if (confirm(message)) {
      setLoading(true);
      try {
        const productsToDelete = deleteCategory === "ALL" 
          ? products 
          : products.filter(p => (p.categoria || p.category) === deleteCategory);

        for (const p of productsToDelete) {
          await deleteDoc(doc(db, "muebles", p.id));
        }

        alert(`Se han eliminado ${productsToDelete.length} productos.`);
        setDeleteCategory(""); 
        setViewCategory(""); // Reseteamos también la vista
        fetchProducts();
      } catch (error) {
        console.error("Error en borrado masivo:", error);
      } finally {
        setLoading(false);
      }
    }
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

      {/* BARRA DE HERRAMIENTAS: IMPORTAR, EXPORTAR Y VACIAR */}
      {!showForm && (
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
            />
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition flex items-center gap-2 text-sm font-semibold"
            >
              <i className="fas fa-file-import"></i> Importar Excel
            </button>
            <button 
              onClick={handleExportExcel} 
              className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition flex items-center gap-2 text-sm font-semibold"
            >
              <i className="fas fa-file-export"></i> Exportar Excel
            </button>
          </div>

          {/* LÓGICA DE BORRADO MASIVO */}
          <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
            <select
              value={deleteCategory}
              onChange={(e) => setDeleteCategory(e.target.value)}
              className="border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 outline-none min-w-[180px] bg-red-50 text-red-800 font-medium"
            >
              <option value="">Filtro para borrar...</option>
              <option value="ALL">⚠️ TODAS LAS CATEGORÍAS</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkDelete} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-semibold"
            >
              <i className="fas fa-trash-alt"></i> Vaciar
            </button>
          </div>
        </div>
      )}

      {/* NUEVO: BARRA DE FILTRO DE VISTA (Para la tabla) */}
      {!showForm && (
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <i className="fas fa-filter text-gray-400"></i>
            <select
              value={viewCategory}
              onChange={(e) => setViewCategory(e.target.value)}
              className="border-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
            >
              <option value="">Ver todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FORMULARIO */}
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
      {!showForm && (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin mr-2"></i> Procesando inventario...
            </div>
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
                {displayedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">
                      <img 
                        src={fixImageURL(product.imagen)} 
                        alt={product.nombre} 
                        className="w-12 h-12 object-cover rounded bg-gray-100" 
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-800">{product.nombre}</td>
                    <td className="p-3 text-sm text-gray-500">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {product.categoria || product.category || 'Sin categoría'}
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

          {!loading && displayedProducts.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              {products.length === 0 
                ? 'No hay productos registrados aún.' 
                : 'No se encontraron productos en esta categoría.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;