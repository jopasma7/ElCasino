import { useState, useEffect } from 'react'
import { Utensils, Euro } from 'lucide-react'
import { dishesAPI } from '../services/api'

const Menu = () => {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState(null)

  const categories = [
    { id: 'all', name: 'Todo' },
    { id: 'entrantes', name: 'Entrantes' },
    { id: 'primeros', name: 'Primeros Platos' },
    { id: 'segundos', name: 'Segundos Platos' },
    { id: 'postres', name: 'Postres' },
    { id: 'bebidas', name: 'Bebidas' }
  ]

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dishesAPI.getAll({ available: true })
      setDishes(response.data)
    } catch (error) {
      console.error('Error al cargar platos:', error)
      setError('No se pudieron cargar los platos. El backend no está disponible.')
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = selectedCategory === 'all' 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando carta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDishes} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Nuestra Carta
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Descubre todos nuestros platos elaborados con productos frescos y de calidad
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="card">
              {/* Image */}
              <div className="h-48 bg-neutral-200 flex items-center justify-center">
                {dish.image ? (
                  <img 
                    src={dish.image.startsWith('http') 
                      ? dish.image 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${dish.image}`
                    } 
                    alt={dish.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <Utensils className={`w-16 h-16 text-neutral-400 ${dish.image ? 'hidden' : ''}`} />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-neutral-900">{dish.name}</h3>
                  <span className="flex items-center gap-1 text-primary-600 font-bold text-lg">
                    <Euro className="w-4 h-4" />
                    {dish.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-neutral-600">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No hay platos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
