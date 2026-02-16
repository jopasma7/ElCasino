import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Edit3, Info, UploadCloud, Save, X } from 'lucide-react';

function InfoRestaurante() {
  // Estado para la información del restaurante
  const [info, setInfo] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    descripcion: '',
    imagen: '/logo192.png',
    horario: 'Lunes a Domingo: 12:00 - 23:00',
    historia: 'Fundado en 1950, El Casino es un referente de la cocina mediterránea en la ciudad.',
    valores: 'Calidad, tradición y atención personalizada.',
    facebook: 'https://facebook.com/elcasino',
    instagram: 'https://instagram.com/elcasino',
    twitter: 'https://twitter.com/elcasino',
    mapa: 'https://goo.gl/maps/123456',
  });


  // Simulación de carga inicial (puedes conectar a API en el futuro)
  useEffect(() => {
    setInfo({
      nombre: 'El Casino',
      direccion: 'Calle Principal 123',
      telefono: '+34 123 456 789',
      email: 'info@elcasino.com',
      descripcion: 'Restaurante tradicional con cocina mediterránea.',
      imagen: '/logo192.png',
      horario: 'Lunes a Domingo: 12:00 - 23:00',
      historia: 'Fundado en 1950, El Casino es un referente de la cocina mediterránea en la ciudad.',
      valores: 'Calidad, tradición y atención personalizada.',
      facebook: 'https://facebook.com/elcasino',
      instagram: 'https://instagram.com/elcasino',
      twitter: 'https://twitter.com/elcasino',
      mapa: 'https://goo.gl/maps/123456',
    });
  }, []);

  // Edición
  const [editMode, setEditMode] = useState(false);
  const [editInfo, setEditInfo] = useState(info);
  const [showImgPreview, setShowImgPreview] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditInfo(info);
  }, [info]);

  // Validación de enlaces
  const isValidUrl = url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Guardar cambios
  const handleSave = () => {
    setInfo(editInfo);
    setEditMode(false);
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditInfo(info);
    setEditMode(false);
    setShowImgPreview(false);
  };

  // Cambiar imagen
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditInfo({ ...editInfo, imagen: ev.target.result });
        setShowImgPreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Accesibilidad: focus en primer input al editar
  const firstInputRef = useRef(null);
  useEffect(() => {
    if (editMode && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [editMode]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 w-full">
        <div className="relative rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-100 shadow p-6 mb-2 flex items-center gap-4 border border-primary-100">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 text-3xl shadow mr-2">
            <Info className="w-9 h-9" />
          </span>
          <div>
            <h2 className="text-3xl font-extrabold text-primary-800 mb-1 drop-shadow-sm tracking-tight">Información del Restaurante</h2>
            <p className="text-primary-700 text-base font-medium">Consulta y edita los datos clave de tu restaurante para mantenerlos siempre actualizados.</p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mb-4">
        <span className="inline-block bg-yellow-200 text-yellow-900 font-semibold px-4 py-2 rounded-lg shadow animate-pulse">Próximamente: edición y guardado real de la información</span>
      </div>
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 rounded-2xl shadow-2xl p-8 border-2 border-primary-500/40 max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
        {/* Imagen destacada y cambio */}
        <div className="relative mb-4">
          <img src={editMode ? editInfo.imagen : info.imagen} alt={info.nombre} className="w-32 h-32 rounded-full border-4 border-primary-200 shadow-lg object-cover transition-transform duration-300 hover:scale-105" aria-label="Logo del restaurante" />
          {editMode && (
            <button
              className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 shadow hover:bg-primary-700 transition"
              onClick={() => fileInputRef.current.click()}
              aria-label="Cambiar imagen"
            >
              <UploadCloud className="w-5 h-5" />
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
            aria-label="Subir nueva imagen"
          />
        </div>
        {/* Botones de edición y guardado */}
        {!editMode ? (
          <button
            className="mb-6 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            onClick={() => setEditMode(true)}
            aria-label="Editar información"
          >
            <Edit3 className="w-5 h-5" /> Editar Información
          </button>
        ) : (
          <div className="mb-6 flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={handleSave}
              aria-label="Guardar cambios"
            >
              <Save className="w-5 h-5" /> Guardar
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={handleCancel}
              aria-label="Cancelar edición"
            >
              <X className="w-5 h-5" /> Cancelar
            </button>
          </div>
        )}
        {/* Tarjetas de datos clave */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Dirección */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 border border-primary-100 animate-fade-in">
            <MapPin className="text-primary-600 w-6 h-6" />
            {!editMode ? (
              <span className="font-semibold">{info.direccion}</span>
            ) : (
              <input
                ref={firstInputRef}
                className="font-semibold border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.direccion}
                onChange={e => setEditInfo({ ...editInfo, direccion: e.target.value })}
                aria-label="Dirección"
              />
            )}
          </div>
          {/* Teléfono */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 border border-primary-100 animate-fade-in">
            <Phone className="text-primary-600 w-6 h-6" />
            {!editMode ? (
              <span className="font-semibold">{info.telefono}</span>
            ) : (
              <input
                className="font-semibold border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.telefono}
                onChange={e => setEditInfo({ ...editInfo, telefono: e.target.value })}
                aria-label="Teléfono"
              />
            )}
            {/* Botón de llamada rápida */}
            {!editMode && (
              <a href={`tel:${info.telefono}`} className="ml-2 text-green-600 hover:text-green-800" aria-label="Llamar">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
          {/* Email */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 border border-primary-100 animate-fade-in">
            <Mail className="text-primary-600 w-6 h-6" />
            {!editMode ? (
              <span className="font-semibold">{info.email}</span>
            ) : (
              <input
                className="font-semibold border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.email}
                onChange={e => setEditInfo({ ...editInfo, email: e.target.value })}
                aria-label="Email"
              />
            )}
            {/* Botón de email rápido */}
            {!editMode && (
              <a href={`mailto:${info.email}`} className="ml-2 text-blue-600 hover:text-blue-800" aria-label="Enviar email">
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
          {/* Horario */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 border border-primary-100 animate-fade-in">
            <Clock className="text-primary-600 w-6 h-6" />
            {!editMode ? (
              <span className="font-semibold">{info.horario}</span>
            ) : (
              <input
                className="font-semibold border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.horario}
                onChange={e => setEditInfo({ ...editInfo, horario: e.target.value })}
                aria-label="Horario"
              />
            )}
          </div>
        </div>
        {/* Descripción */}
        <div className="w-full mb-6 animate-fade-in">
          <div className="bg-primary-50 rounded-xl p-4 shadow border border-primary-100 flex items-center gap-3">
            <Info className="text-primary-600 w-6 h-6" />
            {!editMode ? (
              <span className="font-medium text-primary-800">{info.descripcion}</span>
            ) : (
              <input
                className="font-medium text-primary-800 border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.descripcion}
                onChange={e => setEditInfo({ ...editInfo, descripcion: e.target.value })}
                aria-label="Descripción"
              />
            )}
          </div>
        </div>
        {/* Historia y valores */}
        <div className="w-full flex flex-col md:flex-row gap-6 mb-6 animate-fade-in">
          <div className="flex-1 bg-white rounded-xl shadow p-4 border border-primary-100">
            <h3 className="text-lg font-bold text-primary-700 mb-2">Historia</h3>
            {!editMode ? (
              <p className="text-primary-900">{info.historia}</p>
            ) : (
              <textarea
                className="text-primary-900 border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.historia}
                onChange={e => setEditInfo({ ...editInfo, historia: e.target.value })}
                aria-label="Historia"
              />
            )}
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-4 border border-primary-100">
            <h3 className="text-lg font-bold text-primary-700 mb-2">Valores</h3>
            {!editMode ? (
              <p className="text-primary-900">{info.valores}</p>
            ) : (
              <textarea
                className="text-primary-900 border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full"
                value={editInfo.valores}
                onChange={e => setEditInfo({ ...editInfo, valores: e.target.value })}
                aria-label="Valores"
              />
            )}
          </div>
        </div>
        {/* Redes sociales */}
        <div className="w-full flex items-center justify-center gap-4 mb-6 animate-fade-in">
          {/* Facebook */}
          {!editMode ? (
            <a
              href={isValidUrl(info.facebook) ? info.facebook : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          ) : (
            <input
              className="border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-32 text-xs"
              value={editInfo.facebook}
              onChange={e => setEditInfo({ ...editInfo, facebook: e.target.value })}
              aria-label="Facebook"
            />
          )}
          {/* Instagram */}
          {!editMode ? (
            <a
              href={isValidUrl(info.instagram) ? info.instagram : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white rounded-full p-3 shadow transition focus:outline-none focus:ring-2 focus:ring-pink-400"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          ) : (
            <input
              className="border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-32 text-xs"
              value={editInfo.instagram}
              onChange={e => setEditInfo({ ...editInfo, instagram: e.target.value })}
              aria-label="Instagram"
            />
          )}
          {/* Twitter */}
          {!editMode ? (
            <a
              href={isValidUrl(info.twitter) ? info.twitter : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-400 hover:bg-blue-500 text-white rounded-full p-3 shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          ) : (
            <input
              className="border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-32 text-xs"
              value={editInfo.twitter}
              onChange={e => setEditInfo({ ...editInfo, twitter: e.target.value })}
              aria-label="Twitter"
            />
          )}
        </div>
        {/* Mapa */}
        <div className="w-full mb-2 flex items-center justify-center animate-fade-in">
          {!editMode ? (
            <a
              href={isValidUrl(info.mapa) ? info.mapa : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 font-semibold underline hover:text-primary-900 transition focus:outline-none focus:ring-2 focus:ring-primary-400"
              aria-label="Ver ubicación en Google Maps"
            >
              Ver ubicación en Google Maps
            </a>
          ) : (
            <input
              className="border-b border-primary-300 focus:outline-none focus:border-primary-600 bg-transparent w-full text-xs"
              value={editInfo.mapa}
              onChange={e => setEditInfo({ ...editInfo, mapa: e.target.value })}
              aria-label="Mapa"
            />
          )}
        </div>
      </div>
      {/* Animación CSS */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default InfoRestaurante;
