import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { galleryAPI } from '../../services/api';

const MySwal = withReactContent(Swal);

const Galeria = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    visible: true,
    image: null
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await galleryAPI.getAll();
      setImages(response.data);
    } catch (error) {
      console.error('Error al cargar galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: <span style={{color:'#a66a06',fontWeight:'bold'}}>¿Eliminar imagen?</span>,
      html: '<div style="color:#444">¿Seguro que quieres eliminar esta imagen? <br><b>Esta acción no se puede deshacer.</b></div>',
      icon: 'warning',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonColor: '#a66a06',
      cancelButtonColor: '#d33',
      confirmButtonText: '<b>Eliminar</b>',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-rounded swal2-shadow',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      buttonsStyling: false
    });
    if (!result.isConfirmed) return;
    try {
      await galleryAPI.delete(id);
      setImages(images.filter(i => i.id !== id));
      toast.success('Imagen eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar imagen');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('visible', formData.visible);
      if (formData.image) {
        payload.append('image', formData.image);
      }

      const response = await galleryAPI.create(payload);
      setImages([response.data, ...images]);
      setFormData({ title: '', category: '', visible: true, image: null });
      setShowForm(false);
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisible = async (image) => {
    try {
      const payload = new FormData();
      payload.append('visible', (!image.visible).toString());
      const response = await galleryAPI.update(image.id, payload);
      setImages(images.map(i => i.id === image.id ? response.data : i));
    } catch (error) {
      toast.error('Error al actualizar visibilidad');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-8 w-full">
          <div className="relative rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-100 shadow p-6 mb-2 flex items-center gap-4 border border-primary-100">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 text-3xl shadow mr-2">
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-9 h-9'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6' /></svg>
            </span>
            <div>
              <h2 className="text-3xl font-extrabold text-primary-800 mb-1 drop-shadow-sm tracking-tight">Galería de Imágenes</h2>
              <p className="text-primary-700 text-base font-medium">Gestiona y sube imágenes para mostrar la mejor cara de tu restaurante.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center mb-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Subir Imagen
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Título</label>
              <input
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Categoría</label>
              <input
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Imagen</label>
              <input
                type="file"
                accept="image/*"
                className="input-field"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                required
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="gallery-visible"
                type="checkbox"
                className="h-4 w-4"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              />
              <label htmlFor="gallery-visible" className="text-sm text-neutral-700">Mostrar en galería pública</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Subiendo...' : 'Guardar Imagen'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {images.length === 0 ? (
        <p className="text-center text-neutral-500 py-8">
          No hay imágenes. Sube la primera.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={image.url.startsWith('http')
                    ? image.url
                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${image.url}`
                  }
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisible(image)}
                  className="px-2 py-1 text-xs bg-white/90 rounded-md shadow"
                >
                  {image.visible ? 'Visible' : 'Oculta'}
                </button>
              </div>
              <button 
                onClick={() => handleDelete(image.id)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Galeria;
