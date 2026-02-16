import { useState } from 'react'
import { VERSION } from '../version';
import { Lock } from 'lucide-react'
import { useAdmin } from '../hooks/useAdmin'
import Platos from './admin/Platos';
import Galeria from './admin/Galeria';
import DailyMenu from './admin/DailyMenu';
import Pedidos from './admin/Pedidos';
import GestionReservas from './admin/GestionReservas';
import InfoRestaurante from './admin/InfoRestaurante';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('info')
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
            <button
              onClick={() => setActiveTab('reservas')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'reservas'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Gestionar Reservas
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Información Restaurante
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === 'dishes' && <Platos />}
          {activeTab === 'gallery' && <Galeria />}
          {activeTab === 'dailyMenu' && <DailyMenu />}
          {activeTab === 'orders' && <Pedidos />}
          {activeTab === 'reservas' && <GestionReservas />}
          {activeTab === 'info' && <InfoRestaurante />}
        </div>
      </div>
    </div>
  )
}


export default Admin
