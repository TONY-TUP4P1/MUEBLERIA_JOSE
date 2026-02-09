import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fixImageURL } from '../../utils/images';

const AdminAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado limpio sin coordenadas
  const [info, setInfo] = useState({
    titulo: 'Sobre Nosotros',
    historia: '',
    imagen: '', 
    direccion: '',
    telefono: '',
    email: '',
    horario: ''
  });

  // Cargar datos
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const docRef = doc(db, "content", "about");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Solo tomamos los datos que nos interesan, ignorando lat/lng si existían
            const data = docSnap.data();
            setInfo({
                titulo: data.titulo || '',
                historia: data.historia || '',
                imagen: data.imagen || '',
                direccion: data.direccion || '',
                telefono: data.telefono || '',
                email: data.email || '',
                horario: data.horario || ''
            });
        }
      } catch (error) {
        console.error("Error cargando info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "content", "about"), info, { merge: true });
      alert("¡Información actualizada correctamente!");
    } catch (error) {
      console.error(error);
      alert("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Editar "Nosotros y Contacto"</h1>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
        >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Guardar Cambios
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: HISTORIA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">📖 Historia e Imagen</h2>
            
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Título de la Página</label>
                <input name="titulo" value={info.titulo} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ej: Nuestra Historia" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Descripción / Historia</label>
                <textarea name="historia" value={info.historia} onChange={handleChange} className="w-full border p-3 rounded-lg h-48 resize-none focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Cuenta cómo nació tu negocio..." />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">URL Imagen (Local o Equipo)</label>
                <input name="imagen" value={info.imagen} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" />
                
                {/* Previsualización */}
                {info.imagen && (
                    <div className="mt-4 rounded-lg overflow-hidden h-48 border bg-gray-50">
                        <img src={fixImageURL(info.imagen)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: CONTACTO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 h-fit">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">📍 Datos de Contacto</h2>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Dirección Física</label>
                <input name="direccion" value={info.direccion} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Av. Principal 123..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Teléfono / WhatsApp</label>
                    <input name="telefono" value={info.telefono} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="+51 999..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                    <input name="email" value={info.email} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="contacto@..." />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Horarios de Atención</label>
                <input name="horario" value={info.horario} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Lun-Vie: 9am - 6pm" />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <i className="fas fa-info-circle mr-2"></i>
                Estos datos aparecerán automáticamente en las tarjetas de contacto de la web.
            </div>
        </div>

      </form>
    </div>
  );
};

export default AdminAbout;