import { useState, useEffect } from 'react'
import { Lock, Plus, Edit, Trash2, Image as ImageIcon, LogOut } from 'lucide-react'
import { authAPI, dishesAPI, galleryAPI, dailyMenuAPI } from '../services/api'

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dishes')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken()
    }
  }, [])

  const verifyToken = async () => {
    try {
      await authAPI.verify()
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.login(password)
      localStorage.setItem('token', response.data.token)
      setIsAuthenticated(true)
      setPassword('')
    } catch (error) {
      alert('Contraseña incorrecta')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setActiveTab('dishes')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">Panel de Administración</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Introduce la contraseña (admin123)"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Acceder'}
              </button>
            </form>
            
            <p className="text-sm text-neutral-500 mt-4 text-center">
              Solo personal autorizado
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-neutral-600">
              Gestiona el contenido de tu restaurante
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
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
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === 'dishes' && <DishesManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'dailyMenu' && <DailyMenuManager />}
        </div>
      </div>
    </div>
  )
}

// Component for managing dishes
const DishesManager = () => {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      const response = await dishesAPI.getAll()
      setDishes(response.data)
    } catch (error) {
      console.error('Error al cargar platos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este plato?')) return
    
    try {
      await dishesAPI.delete(id)
      setDishes(dishes.filter(d => d.id !== id))
    } catch (error) {
      alert('Error al eliminar plato')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Platos de la Carta</h2>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Añadir Plato
        </button>
      </div>

      {dishes.length === 0 ? (
        <p className="text-center text-neutral-500 py-8">
          No hay platos. Añade el primero.
        </p>
      ) : (
        <div className="space-y-3">
          {dishes.map((dish) => (
          <div
            key={dish.id}
            className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
          >
            <div>
              <h3 className="font-semibold text-neutral-900">{dish.name}</h3>
              <p className="text-sm text-neutral-600">
                {dish.category} - €{dish.price.toFixed(2)}
                {!dish.available && <span className="text-red-600 ml-2">(No disponible)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-primary-600" />
              </button>
              <button 
                onClick={() => handleDelete(dish.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
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
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return
    
    try {
      await galleryAPI.delete(id)
      setImages(images.filter(i => i.id !== id))
    } catch (error) {
      alert('Error al eliminar imagen')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Galería de Imágenes</h2>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Subir Imagen
        </button>
      </div>

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
    price: '11.50',
    starters: '',
    mains: '',
    desserts: ''
  })

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await dailyMenuAPI.getToday()
      if (response.data) {
        setFormData({
          price: response.data.price.toString(),
          starters: response.data.starters.join('\n'),
          mains: response.data.mains.join('\n'),
          desserts: response.data.desserts.join('\n')
        })
      }
    } catch (error) {
      console.error('Error al cargar menú:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const menuData = {
      price: parseFloat(formData.price),
      includes: ['Primero', 'Segundo', 'Postre o Café', 'Pan y Bebida'],
      starters: formData.starters.split('\n').filter(Boolean),
      mains: formData.mains.split('\n').filter(Boolean),
      desserts: formData.desserts.split('\n').filter(Boolean)
    }

    try {
      await dailyMenuAPI.create(menuData)
      alert('Menú actualizado correctamente')
    } catch (error) {
      alert('Error al actualizar menú')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Menú del Día</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Precio del Menú (€)
          </label>
          <input
            type="number"
            step="0.01"
            className="input-field max-w-xs"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
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

export default Admin
