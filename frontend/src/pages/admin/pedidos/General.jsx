import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ordersAPI } from '../../../services/api';

const MySwal = withReactContent(Swal);

const General = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'preparing', label: 'Preparando' },
    { value: 'ready', label: 'Listo' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter === 'all' ? undefined : { status: statusFilter };
      const response = await ordersAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, status);
      setOrders(orders.map(order => order.id === orderId ? response.data : order));
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando pedidos...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-8 w-full">
          <div className="relative rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-100 shadow p-6 mb-2 flex items-center gap-4 border border-primary-100">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 text-3xl shadow mr-2">
              <ClipboardList className="w-9 h-9" />
            </span>
            <div>
              <h2 className="text-3xl font-extrabold text-primary-800 mb-1 drop-shadow-sm tracking-tight">Gestión de Pedidos</h2>
              <p className="text-primary-700 text-base font-medium">Visualiza, gestiona y actualiza el estado de los pedidos realizados en tu restaurante.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end w-full mb-2">
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
                    {order.isDailyMenu ? (
                      (() => {
                        // Agrupar por menuGroup
                        // Agrupar y ordenar por menuGroup
                        const groups = {};
                        for (const item of order.items) {
                          const group = item.menuGroup ?? 'no-group';
                          if (!groups[group]) groups[group] = [];
                          groups[group].push(item);
                        }
                        // Ordenar los grupos por menuGroup numérico
                        const sortedGroups = Object.keys(groups)
                          .sort((a, b) => Number(a) - Number(b))
                          .map((key) => groups[key]);
                        return sortedGroups.map((groupItems, idx) => {
                          if (groupItems.length === 3) {
                            return (
                              <div key={idx} className="border rounded-lg p-3 bg-white mb-2">
                                <div className="font-semibold text-primary-700 mb-1">Menú Completo</div>
                                <ul className="ml-2 text-sm text-neutral-700 list-disc">
                                  <li><b>Primero:</b> {groupItems[0]?.dishName || groupItems[0]?.dish?.name}</li>
                                  <li><b>Segundo:</b> {groupItems[1]?.dishName || groupItems[1]?.dish?.name}</li>
                                  <li><b>Postre:</b> {groupItems[2]?.dishName || groupItems[2]?.dish?.name}</li>
                                </ul>
                              </div>
                            );
                          } else if (groupItems.length === 2) {
                            return (
                              <div key={idx} className="border rounded-lg p-3 bg-white mb-2">
                                <div className="font-semibold text-primary-700 mb-1">Menú Completo (1 Plato)</div>
                                <ul className="ml-2 text-sm text-neutral-700 list-disc">
                                  <li><b>Plato:</b> {groupItems[0]?.dishName || groupItems[0]?.dish?.name}</li>
                                  <li><b>Postre:</b> {groupItems[1]?.dishName || groupItems[1]?.dish?.name}</li>
                                </ul>
                              </div>
                            );
                          } else {
                            // Fallback para items sueltos
                            return (
                              <div key={groupItems[0].id || idx} className="flex justify-between text-sm text-neutral-700">
                                <span>{groupItems[0].quantity} × {groupItems[0].dish?.name || groupItems[0].dishName || 'Plato eliminado'}</span>
                                {groupItems[0].price > 0 && (
                                  <span className="text-xs text-neutral-500">{groupItems[0].price.toFixed(2)} €</span>
                                )}
                              </div>
                            );
                          }
                        });
                      })()
                    ) : (
                      order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-neutral-700">
                          <span>{item.quantity} × {item.dish?.name || item.dishName || 'Plato eliminado'}</span>
                          {item.price > 0 && (
                            <span className="text-xs text-neutral-500">{item.price.toFixed(2)} €</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default General;