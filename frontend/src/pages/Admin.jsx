import { useState, useEffect, useMemo } from 'react'
import { VERSION } from '../version';
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../sweetalert2-custom.css'

// Imagen de plato con fallback si falla
function DishImage({ src, name }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  const url = src.startsWith('http')
    ? src
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${src}`;
  return (
    <img
      src={url}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}
import { Lock, Plus, Edit, Trash2, LogOut, ClipboardList, Eye, EyeOff, X } from 'lucide-react'

const MySwal = withReactContent(Swal)
import { dishesAPI, galleryAPI, dailyMenuAPI, dailyMenuOptionsAPI, ordersAPI, categoriesAPI } from '../services/api'
import { useAdmin } from '../hooks/useAdmin'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dishes')
  const { isAdmin, loading: adminLoading } = useAdmin()

  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 text-neutral-500">Cargando...</div>
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Lock className="w-8 h-8 text-primary-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-6">Acceso restringido</h1>
            <p className="text-neutral-500">Solo personal administrador autorizado</p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">

        <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-neutral-600">
              Gestiona el contenido de tu restaurante
            </p>
          </div>
          <div className="hidden md:block text-sm text-neutral-400 font-mono mt-2 md:mt-0 text-right">
            <div className="mb-1">Desarrollador: Alejandro Pastor</div>
            Versión {VERSION}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('dishes')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dishes'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Gestionar Platos
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Galería
            </button>
            <button
              onClick={() => setActiveTab('dailyMenu')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dailyMenu'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Menú del Día
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pedidos
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === 'dishes' && <DishesManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'dailyMenu' && <DailyMenuManager />}
          {activeTab === 'orders' && <OrdersManager />}
        </div>
      </div>
    </div>
  )
}

// Component for managing dishes

const DishesManager = () => {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    image: null,
    imageUrl: '' 
  })
  const [categories, setCategories] = useState([{ value: 'all', label: 'Todos', id: 'all' }])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')

  useEffect(() => {
    fetchDishes()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll()
      setCategories([{ value: 'all', label: 'Todos', id: 'all' }, ...res.data.map(c => ({ value: c.id, label: c.name, id: c.id }))])
    } catch (e) {
      setCategories([{ value: 'all', label: 'Todos', id: 'all' }])
    }
  }

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      const response = await dishesAPI.getAll()
      setDishes(response.data)
      // Debug: verificar las primeras 3 imágenes
      console.log('Primeros 3 platos:', response.data.slice(0, 3).map(d => ({ name: d.name, image: d.image })))
    } catch (error) {
      console.error('Error al cargar platos:', error)
    } finally {
      setLoading(false)
    }
  }

  const MySwal = withReactContent(Swal)
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: <span style={{color:'#a66a06',fontWeight:'bold'}}>¿Eliminar plato?</span>,
      html: '<div style="color:#444">¿Seguro que quieres eliminar este plato? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    })
    if (!result.isConfirmed) return
    try {
      await dishesAPI.delete(id)
      setDishes(dishes.filter(d => d.id !== id))
      toast.success('Plato eliminado correctamente')
    } catch (error) {
      toast.error('Error al eliminar plato')
    }
  }

  const filteredDishes = useMemo(() => {
    return selectedCategory === 'all'
      ? dishes
      : dishes.filter(d => d.categoryId === selectedCategory)
  }, [dishes, selectedCategory]);


  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  const handleEdit = (dish) => {
    setEditingId(dish.id)
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.categoryId, // Usar el id de la categoría
      available: dish.available,
      image: null,
      imageUrl: dish.imageUrl || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    if (!formData.category || formData.category === 'all') {
      toast.error('Selecciona una categoría válida para el plato.')
      setSubmitting(false)
      return
    }
    if (!formData.image && !formData.imageUrl) {
      toast.error('Debes subir una imagen o poner una URL.')
      setSubmitting(false)
      return
    }
    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('description', formData.description)
      payload.append('price', formData.price)
      payload.append('categoryId', formData.category)
      payload.append('available', formData.available)
      if (formData.image) {
        payload.append('image', formData.image)
      } else if (formData.imageUrl) {
        payload.append('imageUrl', formData.imageUrl)
      }

      if (editingId) {
        await dishesAPI.update(editingId, payload)
        toast.success('Plato actualizado correctamente')
      } else {
        await dishesAPI.create(payload)
        toast.success('Plato creado correctamente')
      }

      setLoading(true);
      // Recargar la lista completa para asegurar URLs actualizadas
      await fetchDishes();
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true,
        image: null,
        imageUrl: ''
      })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      toast.error(editingId ? 'Error al actualizar plato' : 'Error al crear plato')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    try {
      const res = await categoriesAPI.create({ name: newCategory })
      setCategories([{ value: 'all', label: 'Todos', id: 'all' }, ...categories.slice(1), { value: res.data.id, label: res.data.name, id: res.data.id }])
      setNewCategory('')
      setShowCategoryModal(false)
      toast.success('Categoría añadida')
    } catch (e) {
      toast.error('Error al crear categoría')
    }
  }

  const handleEditCategory = (cat) => {
    setEditingCategoryId(cat.id)
    setEditingCategoryName(cat.label)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (!editingCategoryName.trim()) return
    try {
      await categoriesAPI.update(editingCategoryId, { name: editingCategoryName })
      setCategories(categories.map(c => c.id === editingCategoryId ? { ...c, label: editingCategoryName } : c))
      setEditingCategoryId(null)
      setEditingCategoryName('')
      toast.success('Categoría actualizada')
    } catch (e) {
      toast.error('Error al actualizar categoría')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (cat.id === 'all') return;
    const result = await MySwal.fire({
      title: <span style={{color:'#a66a06',fontWeight:'bold'}}>¿Eliminar categoría?</span>,
      html: `<div style="color:#444">¿Seguro que quieres eliminar la categoría <b>${cat.label}</b>?<br><b>Esta acción no se puede deshacer.</b></div>`,
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
      await categoriesAPI.delete(cat.id);
      setCategories(categories.filter(c => c.id !== cat.id));
      toast.success('Categoría eliminada');
      // Si la categoría eliminada estaba seleccionada, volver a 'all'
      if (selectedCategory === cat.id) setSelectedCategory('all');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        const msg = e.response.data.error;
        if (
          msg.includes('Foreign key constraint') ||
          msg.includes('violates foreign key') ||
          msg.includes('No se puede eliminar una categoría que contiene platos')
        ) {
          toast.error('No se puede eliminar una categoría que contiene platos. Elimina o reasigna los platos primero.');
        } else {
          toast.error('Error al eliminar categoría');
        }
      } else {
        toast.error('Error al eliminar categoría');
      }
    }
  }

  const handleToggleAvailability = async (dish) => {
    try {
      const payload = new FormData()
      payload.append('available', (!dish.available).toString())
      const response = await dishesAPI.update(dish.id, payload)
      setDishes(dishes.map(d => d.id === dish.id ? response.data : d))
    } catch (error) {
      toast.error('Error al actualizar disponibilidad')
    }
  }

  const getDishCountByCategory = (categoryId) => {
    if (categoryId === 'all') return dishes.length
    return dishes.filter(d => d.categoryId === categoryId).length
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
        <h2 className="text-2xl font-semibold">Platos de la Carta</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-secondary flex items-center gap-2"
            type="button"
          >
            <Plus className="w-5 h-5" />
            Añadir Categoría
          </button>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                available: true,
                image: null,
                imageUrl: ''
              })
              setShowForm(!showForm)
            }}
            className="btn-primary flex items-center gap-2"
            type="button"
          >
            <Plus className="w-5 h-5" />
            Añadir Plato
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Nombre</label>
              <input
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Categoría</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona una categoría</option>
                {categories.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Descripción</label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Precio (€)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
              />
              <div className="text-xs text-neutral-400 mt-1">O pega una URL de imagen:</div>
              <input
                type="url"
                className="input-field mt-1"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                id="dish-available"
                type="checkbox"
                className="h-4 w-4"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              />
              <label htmlFor="dish-available" className="text-sm text-neutral-700">Mostrar en carta</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : (editingId ? 'Actualizar Plato' : 'Guardar Plato')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: 'entrantes',
                  available: true,
                  image: null,
                  imageUrl: ''
                })
              }}
              className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Category Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <div className="flex overflow-x-auto gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                selectedCategory === cat.value
                  ? 'text-primary-600 border-primary-600'
                  : 'text-neutral-600 border-transparent hover:text-neutral-900'
              }`}
            >
              {cat.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-100">
                {getDishCountByCategory(cat.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal para añadir/editar/eliminar categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700" onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); }}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Gestionar categorías</h3>
            {/* Añadir nueva */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                className="input-field flex-1"
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">Añadir</button>
            </form>
            {/* Listado de categorías */}
            <ul className="space-y-2 max-h-56 overflow-y-auto">
              {categories.filter(c => c.id !== 'all').map(cat => (
                <li key={cat.id} className="flex items-center gap-2">
                  {editingCategoryId === cat.id ? (
                    <form onSubmit={handleUpdateCategory} className="flex gap-2 flex-1">
                      <input
                        className="input-field flex-1"
                        value={editingCategoryName}
                        onChange={e => setEditingCategoryName(e.target.value)}
                        required
                        autoFocus
                      />
                      <button type="submit" className="btn-primary px-3">Guardar</button>
                      <button type="button" className="px-3 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300" onClick={() => setEditingCategoryId(null)}>Cancelar</button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{cat.label}</span>
                      <button className="p-1 text-primary-600 hover:bg-primary-100 rounded" title="Editar" onClick={() => handleEditCategory(cat)}><Edit className="w-4 h-4" /></button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded" title="Eliminar" onClick={() => handleDeleteCategory(cat)}><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300" onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {filteredDishes.length === 0 ? (
        <p className="text-center text-neutral-500 py-8">
          {selectedCategory === 'all' ? 'No hay platos. Añade el primero.' : `No hay platos en la categoría ${categories.find(c => c.value === selectedCategory)?.label}.`}
        </p>
      ) : (
        <div className="grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 260px))' }}>
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow mx-auto"
              style={{ width: '100%', maxWidth: '260px' }}
            >
              {/* Imagen del plato */}
              <div className="relative h-32 bg-neutral-100">
                <DishImage src={dish.image} name={dish.name} />
                {!dish.available && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                    No disponible
                  </div>
                )}
                <div className="absolute top-2 right-2 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
                  €{dish.price.toFixed(2)}
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-3" style={{ minHeight: '80px', maxHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{dish.name}</h3>
                <p className="text-xs text-neutral-600 mb-2 line-clamp-2" style={{ maxHeight: '32px', overflow: 'hidden' }}>{dish.description}</p>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleAvailability(dish)}
                    className="flex-1 px-2 py-1 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1"
                    title={dish.available ? 'Ocultar de la carta' : 'Mostrar en la carta'}
                  >
                    {dish.available ? (
                      <><Eye className="w-4 h-4" /> Visible</>
                    ) : (
                      <><EyeOff className="w-4 h-4" /> Oculto</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleEdit(dish)}
                    className="p-1 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors"
                    title="Editar plato"
                  >
                    <Edit className="w-4 h-4 text-primary-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(dish.id)}
                    className="p-1 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                    title="Eliminar plato"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Component for managing gallery
const GalleryManager = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    visible: true,
    image: null
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await galleryAPI.getAll()
      setImages(response.data)
    } catch (error) {
      console.error('Error al cargar galería:', error)
    } finally {
      setLoading(false)
    }
  }

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
    })
    if (!result.isConfirmed) return
    try {
      await galleryAPI.delete(id)
      setImages(images.filter(i => i.id !== id))
      toast.success('Imagen eliminada correctamente')
    } catch (error) {
      toast.error('Error al eliminar imagen')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('category', formData.category)
      payload.append('visible', formData.visible)
      if (formData.image) {
        payload.append('image', formData.image)
      }

      const response = await galleryAPI.create(payload)
      setImages([response.data, ...images])
      setFormData({ title: '', category: '', visible: true, image: null })
      setShowForm(false)
    } catch (error) {
      toast.error('Error al subir imagen')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleVisible = async (image) => {
    try {
      const payload = new FormData()
      payload.append('visible', (!image.visible).toString())
      const response = await galleryAPI.update(image.id, payload)
      setImages(images.map(i => i.id === image.id ? response.data : i))
    } catch (error) {
      toast.error('Error al actualizar visibilidad')
    }
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Galería de Imágenes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Subir Imagen
        </button>
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
  )
}

// Component for managing daily menu
const DailyMenuManager = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    price: '9.50',
    completeSingleDishPrice: '8.50',
    starters: '',
    mains: '',
    desserts: ''
  })
  const [menuOptions, setMenuOptions] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionSubmitting, setOptionSubmitting] = useState(false)
  const [optionForm, setOptionForm] = useState({
    name: '',
    type: 'starter'
  })

  useEffect(() => {
    fetchMenus()
    fetchOptions()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await dailyMenuAPI.getToday()
      // Soportar respuesta { menu: null } o { ...menu }
      const menu = response.data.menu === undefined ? response.data : response.data.menu;
      if (menu) {
        setFormData({
          price: menu.price?.toString() || '9.50',
          completeSingleDishPrice: menu.completeSingleDishPrice?.toString() || '8.50',
          starters: Array.isArray(menu.starters) ? menu.starters.join('\n') : '',
          mains: Array.isArray(menu.mains) ? menu.mains.join('\n') : '',
          desserts: Array.isArray(menu.desserts) ? menu.desserts.join('\n') : ''
        })
      }
    } catch (error) {
      console.error('Error al cargar menú:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const response = await dailyMenuOptionsAPI.getAll()
      setMenuOptions(response.data)
    } catch (error) {
      console.error('Error al cargar opciones de menú:', error)
    } finally {
      setOptionsLoading(false)
    }
  }

  const handleCreateOption = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault()
    }
    if (!optionForm.name.trim()) return
    setOptionSubmitting(true)
    try {
      const response = await dailyMenuOptionsAPI.create({
        name: optionForm.name.trim(),
        type: optionForm.type
      })
      setMenuOptions([response.data, ...menuOptions])
      setOptionForm({ name: '', type: optionForm.type })
    } catch (error) {
      toast.error('Error al crear opción')
    } finally {
      setOptionSubmitting(false)
    }
  }

  const handleRemoveOption = async (id) => {
    const result = await MySwal.fire({
      title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar opción?</span>',
      html: '<div style="color:#444">¿Seguro que quieres eliminar esta opción rápida? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    })
    if (!result.isConfirmed) return;
    try {
      await dailyMenuOptionsAPI.remove(id)
      setMenuOptions(menuOptions.filter(option => option.id !== id))
      toast.success('Opción eliminada correctamente')
    } catch (error) {
      toast.error('Error al eliminar opción')
    }
  }

  const appendOptionToList = (type, name) => {
    if (type === 'starter') {
      const currentItems = formData.starters.split('\n').filter(Boolean)
      if (currentItems.includes(name)) return
      const updated = formData.starters ? `${formData.starters}\n${name}` : name
      setFormData({ ...formData, starters: updated })
    }
    if (type === 'main') {
      const currentItems = formData.mains.split('\n').filter(Boolean)
      if (currentItems.includes(name)) return
      const updated = formData.mains ? `${formData.mains}\n${name}` : name
      setFormData({ ...formData, mains: updated })
    }
    if (type === 'dessert') {
      const currentItems = formData.desserts.split('\n').filter(Boolean)
      if (currentItems.includes(name)) return
      const updated = formData.desserts ? `${formData.desserts}\n${name}` : name
      setFormData({ ...formData, desserts: updated })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    const menuData = {
      price: parseFloat(formData.price),
      completeSingleDishPrice: parseFloat(formData.completeSingleDishPrice),
      includes: ['Primero', 'Segundo', 'Postre o Café', 'Pan y Bebida'],
      starters: formData.starters.split('\n').filter(Boolean),
      mains: formData.mains.split('\n').filter(Boolean),
      desserts: formData.desserts.split('\n').filter(Boolean)
    }

    try {
      await dailyMenuAPI.create(menuData)
      toast.success('Menú actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar menú')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }
  // Eliminar menú del día
  const handleDeleteMenu = async () => {
    const result = await MySwal.fire({
      title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar menú del día?</span>',
      html: '<div style="color:#444">¿Seguro que quieres eliminar el menú del día? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    })
    if (!result.isConfirmed) return;
    try {
      // Obtener el menú actual (solo si existe)
      const response = await dailyMenuAPI.getToday();
      if (response.data && response.data.id) {
        await dailyMenuAPI.delete(response.data.id);
        toast.success('Menú eliminado correctamente');
        setFormData({
          price: '9.50',
          completeSingleDishPrice: '8.50',
          starters: '',
          mains: '',
          desserts: ''
        });
      } else {
        toast.info('No hay menú del día para eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar el menú');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Menú del Día</h2>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          onClick={handleDeleteMenu}
        >
          Eliminar Menú
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Precio del Menú Completo (2 Platos) (€)
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Precio del Menú Completo (1 Plato) (€)
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.completeSingleDishPrice}
              onChange={(e) => setFormData({ ...formData, completeSingleDishPrice: e.target.value })}
              required
            />
          </div>

        </div>

        <div className="border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Opciones rápidas</h3>
              <p className="text-sm text-neutral-600">Crea y reutiliza opciones para el menú diario</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="input-field md:col-span-2"
              placeholder="Ej: Lentejas caseras"
              value={optionForm.name}
              onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
            />
            <select
              className="input-field"
              value={optionForm.type}
              onChange={(e) => setOptionForm({ ...optionForm, type: e.target.value })}
            >
              <option value="starter">Primeros</option>
              <option value="main">Segundos</option>
              <option value="dessert">Postres</option>
            </select>
            <button type="button" onClick={handleCreateOption} className="btn-primary" disabled={optionSubmitting}>
              {optionSubmitting ? 'Guardando...' : 'Añadir'}
            </button>
          </div>

          {optionsLoading ? (
            <div className="text-sm text-neutral-500">Cargando opciones...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['starter', 'main', 'dessert'].map((type) => (
                <div key={type} className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-semibold text-neutral-800 mb-3">
                    {type === 'starter' && 'Primeros'}
                    {type === 'main' && 'Segundos'}
                    {type === 'dessert' && 'Postres'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {menuOptions.filter(option => option.type === type).map((option) => {
                      const isSelected = (() => {
                        if (type === 'starter') {
                          return formData.starters.split('\n').filter(Boolean).includes(option.name)
                        }
                        if (type === 'main') {
                          return formData.mains.split('\n').filter(Boolean).includes(option.name)
                        }
                        if (type === 'dessert') {
                          return formData.desserts.split('\n').filter(Boolean).includes(option.name)
                        }
                        return false
                      })()
                      
                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => appendOptionToList(type, option.name)}
                          disabled={isSelected}
                          className={`group inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                            isSelected 
                              ? 'bg-primary-500 text-white cursor-not-allowed' 
                              : 'bg-neutral-100 hover:bg-primary-100'
                          }`}
                        >
                          <span className={`text-sm ${
                            isSelected 
                              ? 'text-white' 
                              : 'text-neutral-700 group-hover:text-primary-700'
                          }`}>
                            {option.name}
                          </span>
                          <span
                            className="text-neutral-400 hover:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleRemoveOption(option.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Primeros Platos (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.starters}
            onChange={(e) => setFormData({ ...formData, starters: e.target.value })}
            placeholder="Lentejas caseras&#10;Arroz a banda&#10;Ensalada mixta&#10;..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Segundos Platos (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.mains}
            onChange={(e) => setFormData({ ...formData, mains: e.target.value })}
            placeholder="Pollo al ajillo&#10;Merluza a la plancha&#10;..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Postres (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.desserts}
            onChange={(e) => setFormData({ ...formData, desserts: e.target.value })}
            placeholder="Tarta casera&#10;Flan&#10;Fruta del tiempo&#10;..."
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Actualizar Menú del Día
        </button>
      </form>
    </div>
  )
}

// Component for managing orders
const OrdersManager = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'preparing', label: 'Preparando' },
    { value: 'ready', label: 'Listo' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ]

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = statusFilter === 'all' ? undefined : { status: statusFilter }
      const response = await ordersAPI.getAll(params)
      setOrders(response.data)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, status)
      setOrders(orders.map(order => order.id === orderId ? response.data : order))
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando pedidos...</div>
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Pedidos</h2>
          <p className="text-sm text-neutral-600">Seguimiento de pedidos realizados</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 transition-colors">
            Actualizar
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-neutral-500 py-8">No hay pedidos todavía.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-neutral-200 rounded-2xl p-0 shadow-md hover:shadow-xl transition-shadow bg-white overflow-hidden">
              {/* Cabecera */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 bg-gradient-to-r from-primary-50 to-white border-b border-neutral-100">
                <div>
                  <h3 className="text-xl font-bold text-primary-700 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary-500" /> Pedido #{order.orderNumber}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(order.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                  </span>
                  <select
                    className="input-field"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6">
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <p className="text-sm text-neutral-700">{order.customerName}</p>
                  <p className="text-sm text-neutral-700">{order.customerPhone}</p>
                  {order.customerAddress && (
                    <p className="text-sm text-neutral-700">{order.customerAddress}</p>
                  )}
                  {order.user && (
                    <p className="text-xs text-neutral-500 mt-2">Cuenta: {order.user.name}</p>
                  )}
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 md:col-span-2">
                  <h4 className="font-semibold mb-2">Detalle</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-neutral-700">
                        <span>{item.quantity} × {item.dish?.name || 'Plato eliminado'}</span>
                        <span>€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {order.isDailyMenu ? (
                        // Si es menú del día, mostrar el precio fijo guardado en order.total
                        `€${order.total.toFixed(2)}`
                      ) : (
                        // Si no, mostrar la suma de los items
                        `€${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-neutral-500 mt-2">Notas: {order.notes}</p>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2 mt-4">
                    {order.status === 'pending' && (
                      <button
                        className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                      >
                        Aprobar
                      </button>
                    )}
                    {['confirmed', 'preparing', 'ready'].includes(order.status) && (
                      <button
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                        onClick={() => handleStatusChange(order.id, 'completed')}
                      >
                        Marcar como Hecho
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <button
                        className="px-3 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                        onClick={async () => {
                          const result = await MySwal.fire({
                            title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar pedido?</span>',
                            html: '<div style="color:#444">¿Seguro que quieres borrar este pedido? <br><b>Esta acción no se puede deshacer.</b></div>',
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
                            await ordersAPI.cancel(order.id);
                            setOrders(orders => orders.filter(o => o.id !== order.id));
                            toast.success('Pedido eliminado correctamente');
                          } catch (err) {
                            toast.error('Error al borrar el pedido');
                          }
                        }}
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin
