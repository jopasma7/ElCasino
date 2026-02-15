import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ordersAPI } from '../../services/api';

const MySwal = withReactContent(Swal);

const Pedidos = () => {
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
                        `€${order.total.toFixed(2)}`
                      ) : (
                        `€${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-neutral-500 mt-2">Notas: {order.notes}</p>
                  )}
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
  );

};

export default Pedidos;

