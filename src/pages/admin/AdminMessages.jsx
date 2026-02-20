import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Nuevo estado para errores

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("fecha", "desc"));
    
    // IMPORTANTE: onSnapshot recibe 3 argumentos: query, callbackSuccess, callbackError
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
        setLoading(false);
        setError(null); // Limpiar errores si tuvo éxito
      },
      (err) => {
        // AQUÍ ATRAPAMOS EL ERROR PARA QUE NO CRASHEE LA APP
        console.error("❌ Error obteniendo mensajes:", err);
        setError("No tienes permisos para ver los mensajes o hubo un error de conexión.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Marcar como leído
  const markAsRead = async (id, statusActual) => {
    if (statusActual) return; 
    try {
        await updateDoc(doc(db, "messages", id), { leido: true });
    } catch (err) {
        console.error("Error al actualizar:", err);
        alert("No tienes permiso para editar mensajes.");
    }
  };

  // Borrar mensaje
  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de borrar este mensaje?")) {
      try {
        await deleteDoc(doc(db, "messages", id));
      } catch (err) {
        console.error("Error al borrar:", err);
        alert("No tienes permiso para borrar mensajes.");
      }
    }
  };

  // Formatear fecha (Con protección contra crashes si timestamp es null)
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Sin fecha';
    return new Date(timestamp.seconds * 1000).toLocaleDateString("es-ES", {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="p-8">Cargando mensajes...</div>;

  // Renderizado condicional si hubo error
  if (error) {
    return (
        <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error de Acceso: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bandeja de Entrada</h1>
        <div className="text-gray-500 font-medium">
            {messages.filter(m => !m.leido).length} mensajes nuevos
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <i className="fas fa-envelope-open text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No tienes mensajes todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`relative bg-white p-6 rounded-xl border transition-all duration-200 
                        ${msg.leido ? 'border-gray-200 opacity-80' : 'border-l-4 border-l-blue-600 border-gray-200 shadow-md'}
                    `}
                    onClick={() => markAsRead(msg.id, msg.leido)}
                >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                ${msg.leido ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}
                            `}>
                                {/* Protección por si no hay nombre */}
                                {(msg.nombre || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className={`text-lg ${msg.leido ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                    {msg.nombre || "Anónimo"}
                                    {!msg.leido && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">NUEVO</span>}
                                </h3>
                                <a href={`mailto:${msg.email}`} className="text-sm text-gray-500 hover:text-blue-600 hover:underline">
                                    {msg.email}
                                </a>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                            {formatDate(msg.fecha)}
                        </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {msg.mensaje}
                    </p>

                    <div className="mt-4 flex justify-end gap-3">
                        <a 
                            href={`mailto:${msg.email}?subject=Respuesta a tu consulta&body=Hola ${msg.nombre}, respecto a tu mensaje...`}
                            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <i className="fas fa-reply mr-1"></i> Responder
                        </a>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                            className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded transition"
                        >
                            <i className="fas fa-trash-alt mr-1"></i> Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;