import { useState, useEffect } from 'react'
import { Calendar, Euro, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dailyMenuAPI } from '../services/api'

const DailyMenu = () => {
  const [dailyMenu, setDailyMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDailyMenu()
  }, [])

  const fetchDailyMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dailyMenuAPI.getToday()
      const menu = response.data
      
      // Formatear la fecha
      menu.formattedDate = new Date(menu.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      setDailyMenu(menu)
    } catch (error) {
      console.error('Error al cargar menú del día:', error)
      setError('No hay menú del día disponible o el backend no está activo.')
    } finally {
      setLoading(false)
    }
  }
      console.error('Error al cargar menú del día:', error)
      setError('No hay menú del día disponible o el backend no está activo.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando menú del día...</p>
        </div>
      </div>
    )
  }

  if (error || !dailyMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-neutral-600 text-lg mb-4">{error || 'No hay menú disponible para hoy'}</p>
          <button onClick={fetchDailyMenu} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-5 h-5" />
            <span className="font-medium capitalize">{dailyMenu.formattedDate}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Menú del Día
          </h1>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary-600">
            <Euro className="w-8 h-8" />
            <span>{dailyMenu.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Includes */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">El menú incluye:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dailyMenu.includes.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Primeros */}
          <div className="card">
            <div className="bg-primary-600 text-white p-4">
              <h3 className="text-xl font-semibold text-center">Primeros Platos</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {dailyMenu.starters.map((dish, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700">{dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Segundos */}
          <div className="card">
            <div className="bg-primary-600 text-white p-4">
              <h3 className="text-xl font-semibold text-center">Segundos Platos</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {dailyMenu.mains.map((dish, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700">{dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Postres */}
          <div className="card">
            <div className="bg-primary-600 text-white p-4">
              <h3 className="text-xl font-semibold text-center">Postres</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {dailyMenu.desserts.map((dessert, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700">{dessert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/pedido" className="btn-primary inline-block">
            Reservar Menú del Día
          </Link>
          <p className="text-neutral-600 mt-4">
            ¿Prefieres comer en el restaurante? ¡Ven sin reserva!
          </p>
        </div>
      </div>
    </div>
  )
}

export default DailyMenu
