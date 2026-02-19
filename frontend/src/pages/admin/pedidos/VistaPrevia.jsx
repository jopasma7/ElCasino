import { useEffect, useState } from 'react';
import { dailyMenuAPI, ordersAPI } from '../../../services/api';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
const MySwal = withReactContent(Swal);

const VistaPrevia = () => {
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Suponiendo que la API acepta un parámetro de fecha
      const [menuRes, ordersRes] = await Promise.all([
        dailyMenuAPI.getToday(date),
        ordersAPI.getAll({ isDailyMenu: true, date })
      ]);
      setMenus(menuRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  // Agrupar platos por tipo y contar cantidades
  const getDishCounts = () => {
    const dishCounts = {};
    orders.filter(order => order.status !== 'cancelled').forEach(order => {
      order.items.forEach(item => {
        const name = item.dishName || item.dish?.name || 'Plato eliminado';
        // Filtrar postres
        const lowerName = name.toLowerCase();
        if (
          lowerName.includes('postre') ||
          lowerName.includes('dessert') ||
          lowerName.includes('tarta') ||
          lowerName.includes('flan') ||
          lowerName.includes('helado') ||
          lowerName.includes('mousse')
        ) {
          return;
        }
        if (!dishCounts[name]) dishCounts[name] = 0;
        dishCounts[name] += item.quantity;
      });
    });
    return dishCounts;
  };

  const dishCounts = getDishCounts();

  return (
    <div className="p-4">
      <h2 className="text-3xl font-extrabold mb-6 text-primary-800 drop-shadow-sm tracking-tight flex items-center gap-2">
        <span className="inline-block bg-primary-100 rounded-full p-2">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
        Vista Previa de Menús Diarios
      </h2>
      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="date" className="font-medium text-primary-700">Filtrar por fecha:</label>
        <input
          id="date"
          type="date"
          className="input-field border-primary-300 focus:border-primary-500 focus:ring-primary-200 transition"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center py-8 animate-pulse text-primary-500">Cargando menús...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(dishCounts).map(([dish, count]) => (
              <div key={dish} className="rounded-2xl shadow-lg border border-primary-100 bg-white p-6 flex flex-col items-center hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-primary-700">{dish}</span>
                  <span className="inline-block bg-primary-200 text-primary-800 rounded-full px-3 py-1 text-lg font-semibold shadow-sm">
                    {count}
                  </span>
                </div>
                <span className="text-sm text-neutral-500">Total pedidos</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-4 text-primary-700">Pedidos detallados</h3>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <div className="text-neutral-500 py-6">
                  No hay registros de pedidos detallados para la fecha seleccionada.<br />
                  Por favor, verifica otra fecha o espera a que se registren nuevos pedidos.
                </div>
              ) : (
                orders.filter(order => order.status !== 'cancelled').map(order => (
                  <div key={order.id} className="flex items-center text-sm bg-neutral-50 rounded-lg py-2 px-3 shadow-sm mb-1 border border-neutral-200">
                    <span className="font-bold mr-3 flex items-center gap-1 text-primary-700">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/></svg>
                      {order.customerName || (order.user && order.user.name) || 'Usuario'}:
                    </span>
                    <div className="flex flex-wrap gap-2 overflow-x-auto">
                      {order.items.map(item => (
                        <span key={item.id} className="bg-primary-200 text-primary-800 rounded-full px-3 py-1 font-semibold text-xs shadow">
                          {item.quantity >= 2 ? `${item.quantity}×` : ''}{item.dishName || item.dish?.name || 'Plato eliminado'}
                        </span>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <button
                      className="ml-4 px-3 py-1 rounded border border-red-300 text-red-600 bg-white font-semibold text-xs hover:bg-red-100 transition"
                      style={{ minWidth: 80 }}
                      onClick={async () => {
                        const result = await MySwal.fire({
                          title: '¿Eliminar pedido?',
                          text: 'Esta acción no se puede deshacer.',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#2563eb',
                          cancelButtonColor: '#aaa',
                          confirmButtonText: 'Sí, eliminar',
                          cancelButtonText: 'Cancelar',
                        });
                        if (result.isConfirmed) {
                          try {
                            await ordersAPI.cancel(order.id);
                            setOrders(orders => orders.filter(o => o.id !== order.id));
                            MySwal.fire('Eliminado', 'El pedido ha sido eliminado.', 'success');
                          } catch (e) {
                            MySwal.fire('Error', 'Error al eliminar el pedido', 'error');
                          }
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VistaPrevia;
