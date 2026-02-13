import { Navigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'

const TPV = () => {
  const { isAdmin, loading } = useAdmin()

  if (loading) return <div className="text-center py-12">Cargando...</div>
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">TPV - Terminal Punto de Venta</h1>
        <button className="btn-primary px-6 py-2">Nuevo ticket</button>
      </div>

      {/* Zona central mejorada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[70vh]">
        {/* Columna izquierda: productos */}
        <div className="md:col-span-2 flex flex-col h-full">
          {/* Buscador y filtros */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Buscar producto o plato..."
              className="input-field flex-1"
            />
            <select className="input-field w-48">
              <option value="">Todas las categorías</option>
              <option value="platos">Platos</option>
              <option value="bebidas">Bebidas</option>
              <option value="menus">Menús</option>
            </select>
          </div>
          {/* Listado de productos con scroll */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-xl font-bold text-primary-600">🍽️</span>
                  </div>
                  <div className="font-semibold mb-1 text-center text-sm">Producto {i+1}</div>
                  <div className="text-primary-600 font-bold mb-2 text-sm">€{((i+1)*2).toFixed(2)}</div>
                  <button className="btn-primary w-full py-1 text-sm">Añadir</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha: ticket con scroll y cabecera fija */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col h-2/3 min-h-[320px] max-h-[380px]">
            <h2 className="text-xl font-bold mb-4 flex-shrink-0">Ticket actual</h2>
            {/* Lista de productos en el ticket (simulado) con scroll */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {Array.from({length: 12}, (_, idx) => ({nombre:'Producto '+(idx+1),precio:1.5+idx,cantidad:1+idx%3})).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{item.nombre}</div>
                    <div className="text-xs text-neutral-500">€{item.precio.toFixed(2)} x {item.cantidad}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 bg-neutral-100 rounded">-</button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <button className="px-2 py-1 bg-neutral-100 rounded">+</button>
                    <button className="ml-2 text-red-500 hover:text-red-700">🗑️</button>
                  </div>
                  <div className="font-semibold text-sm">€{(item.precio*item.cantidad).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold flex-shrink-0">
              <span>Total:</span>
              <span className="text-primary-600">€42.00</span>
            </div>
          </div>
          {/* Cobro */}
          <div className="bg-white rounded-xl shadow-md p-6 flex-shrink-0">
            <h2 className="text-lg font-semibold mb-4">Cobro</h2>
            <div className="mb-3">
              <label className="block text-sm mb-1">Método de pago</label>
              <select className="input-field w-full">
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Bizum</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Importe entregado</label>
              <input type="number" className="input-field w-full" placeholder="0.00" />
            </div>
            <div className="mb-4 text-sm text-neutral-600">Cambio: <span className="font-bold">€0.00</span></div>
            <button className="btn-primary w-full py-3 text-lg">Cobrar y cerrar ticket</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TPV
