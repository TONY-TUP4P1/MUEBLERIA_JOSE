import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fixImageURL } from '../../utils/images';

const AdminAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false); // Estado para el botón de buscar dirección
  
  // Estado inicial
  const [info, setInfo] = useState({
    titulo: 'Sobre Nosotros',
    historia: '',
    imagen: '', 
    direccion: '',
    telefono: '',
    email: '',
    horario: '',
    lat: '', 
    lng: ''  
  });

  // Cargar datos
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const docRef = doc(db, "content", "about");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setInfo({
                titulo: data.titulo || '',
                historia: data.historia || '',
                imagen: data.imagen || '',
                direccion: data.direccion || '',
                telefono: data.telefono || '',
                email: data.email || '',
                horario: data.horario || '',
                lat: data.lat || '', 
                lng: data.lng || ''  
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

  // FUNCIÓN NUEVA: Buscar dirección usando las coordenadas
  const handleGetAddress = async () => {
    if (!info.lat || !info.lng) {
        alert("⚠️ Por favor, ingresa primero la latitud y longitud.");
        return;
    }

    setFetchingAddress(true);
    try {
        // Hacemos una consulta directa a Google Geocoding API
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${info.lat},${info.lng}&key=AIzaSyBIZrptkE0IGakPhzMzMpq4PaW_gw_D1vk`);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            // Tomamos la primera dirección que encuentre (la más exacta)
            const foundAddress = data.results[0].formatted_address;
            setInfo(prev => ({ ...prev, direccion: foundAddress }));
        } else {
            alert("No se encontró una dirección exacta para estas coordenadas.");
        }
    } catch (error) {
        console.error("Error buscando dirección:", error);
        alert("Hubo un error al intentar conectar con Google Maps.");
    } finally {
        setFetchingAddress(false);
    }
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
                
                {info.imagen && (
                    <div className="mt-4 rounded-lg overflow-hidden h-48 border bg-gray-50">
                        <img src={fixImageURL(info.imagen)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: CONTACTO Y MAPA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 h-fit">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">📍 Datos de Contacto y Ubicación</h2>

            {/* SECCIÓN NUEVA: COORDENADAS DEL MAPA PRIMERO */}
            <h3 className="font-bold text-gray-700 mt-2 border-b pb-2">🗺️ Ubicación en Google Maps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Latitud</label>
                    <input name="lat" value={info.lat} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ej: -12.046374" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Longitud</label>
                    <input name="lng" value={info.lng} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ej: -77.042793" />
                </div>
            </div>
            
            <button 
                type="button" 
                onClick={handleGetAddress}
                disabled={fetchingAddress}
                className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold py-2 rounded-lg transition border border-blue-200"
            >
                {fetchingAddress ? 'Buscando...' : '📍 Obtener Dirección desde las coordenadas'}
            </button>

            {/* DIRECCIÓN QUE SE AUTOCOMPLETA */}
            <div className="mt-4">
                <label className="block text-sm font-bold text-gray-600 mb-1">Dirección Física (Se ve en la web)</label>
                <input 
                    name="direccion" 
                    value={info.direccion} 
                    onChange={handleChange} 
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50" 
                    placeholder="La dirección aparecerá aquí..." 
                />
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
            
        </div>

      </form>
    </div>
  );
};

export default AdminAbout;