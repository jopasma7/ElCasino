import { Navigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { dishesAPI, categoriesAPI } from '../services/api'
import { ticketsAPI } from '../services/ticketsAPI'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'
import { userProfileAPI } from '../services/api'
import { config } from '../config'

const TPV = () => {
  const socketRef = useRef(null)
  const [cobroOpen, setCobroOpen] = useState(false);
      const [mesa, setMesa] = useState(1)
      const [ticket, setTicket] = useState([])
      const [ticketsPorMesa, setTicketsPorMesa] = useState(Array(10).fill([]))
      const [ticketNamesPorMesa, setTicketNamesPorMesa] = useState(Array(10).fill('Ticket'))
      const [ticketName, setTicketName] = useState(`Ticket Mesa 1`)
      const [editingName, setEditingName] = useState(false)

      // Cambiar de mesa y cargar su ticket
      const handleMesaChange = async (num) => {
        // Salir de la room anterior y unirse a la nueva
        if (socketRef.current) {
          if (mesa !== num) {
            socketRef.current.emit('leaveMesa', mesa); // salir de la mesa actual
            socketRef.current.emit('joinMesa', num);   // unirse a la nueva mesa
          }
        }
        setMesa(num);
        // Leer ticket desde backend
        try {
          const res = await ticketsAPI.getTicket(num);
          if (res.data) {
            setTicketName(res.data.name);
            setTicket(res.data.items.map(item => ({
              id: item.dishId,
              name: item.dish.name,
              price: item.price,
              cantidad: item.cantidad
            })));
          } else {
            setTicket([]);
            setTicketName(`Ticket Mesa ${num}`);
          }
        } catch {
          setTicket([]);
          setTicketName(`Ticket Mesa ${num}`);
        }
      }

      // Al montar, cargar el ticket de la mesa seleccionada por defecto
      useEffect(() => {
        const cargarTicketInicial = async () => {
          try {
            const res = await ticketsAPI.getTicket(1);
            if (res.data) {
              setTicketName(res.data.name);
              setTicket(res.data.items.map(item => ({
                id: item.dishId,
                name: item.dish.name,
                price: item.price,
                cantidad: item.cantidad
              })));
            } else {
              setTicket([]);
              setTicketName('Ticket Mesa 1');
            }
          } catch {
            setTicket([]);
            setTicketName('Ticket Mesa 1');
          }
        };
        cargarTicketInicial();
      }, []);

      useEffect(() => {
        // Solo crear la conexión una vez
        const socket = io(config.wsUrl)
        socketRef.current = socket
        socket.emit('joinMesa', mesa);

        const fetchAndIdentify = async () => {
          try {
            const res = await userProfileAPI.getMe()
            const name = res.data?.name || 'Desconocido'
            socket.emit('identify', { name })
          } catch {
            socket.emit('identify', { name: 'Desconocido' })
          }
        }
        fetchAndIdentify()

        // Cleanup global
        return () => {
          socket.disconnect();
        }
      }, [])

      // Listener dependiente de mesa
      useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        const ticketUpdatedHandler = async (data) => {
          if (data.mesa === mesa) {
            try {
              const res = await ticketsAPI.getTicket(mesa)
              if (res.data) {
                setTicketName(res.data.name)
                setTicket(res.data.items.map(item => ({
                  id: item.dishId,
                  name: item.dish.name,
                  price: item.price,
                  cantidad: item.cantidad
                })))
              } else {
                setTicket([])
                setTicketName('Ticket')
              }
            } catch {
              setTicket([])
              setTicketName('Ticket')
            }
          }
        };
        socket.on('ticketUpdated', ticketUpdatedHandler);
        return () => {
          socket.off('ticketUpdated', ticketUpdatedHandler);
        }
      }, [mesa])

      // Emitir ticket actualizado al backend y guardar en DB
      const [isUpdating, setIsUpdating] = useState(false);
      const [pendingUpdate, setPendingUpdate] = useState(null);
      const emitTicketUpdate = async (ticketData = null) => {
        const data = ticketData || { mesa, ticket, ticketName };
        if (isUpdating) {
          setPendingUpdate(data);
          return;
        }
        setIsUpdating(true);
        try {
          // Primero guardar en backend
          const payload = {
            name: data.ticketName,
            items: data.ticket.map(item => ({
              dishId: item.id,
              cantidad: item.cantidad,
              price: item.price
            }))
          };
          await ticketsAPI.updateTicket(data.mesa, payload);
          // Emitir evento solo después de guardar
          socketRef.current.emit('updateTicket', {
            mesa: data.mesa,
            ticket: data.ticket,
            ticketName: data.ticketName
          });
          toast.success('Ticket enviado correctamente', { position: 'top-right' });
        } catch (e) {
          toast.error('Error al enviar el ticket', { position: 'top-right' });
        } finally {
          setIsUpdating(false);
        }
      };

    // Añadir producto al ticket
      const handleAdd = (dish) => {
        setTicket(prev => {
          const idx = prev.findIndex(item => item.id === dish.id);
          let updated;
          if (idx >= 0) {
          updated = [...prev];
          updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + 1 };
          } else {
          updated = [...prev, { ...dish, cantidad: 1 }];
          }
          return updated;
        });
      };

    // Modificar cantidad
      const handleChangeQty = (id, delta) => {
        setTicket(prev => {
          const updated = prev.map(item =>
            item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
          );
          return updated;
        });
      };

    // Eliminar producto
      const handleRemove = (id) => {
          setTicket(prev => {
            const updated = prev.filter(item => item.id !== id);
            return updated;
          });
      };
      // Eliminado el envío automático del ticket en cada cambio

    // Calcular total
    const total = ticket.reduce((sum, item) => sum + item.price * item.cantidad, 0)
  const { isAdmin, loading } = useAdmin()
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true)
      try {
        const [dishRes, catRes] = await Promise.all([
          dishesAPI.getAll(),
          categoriesAPI.getAll()
        ])
        setDishes(dishRes.data)
        setCategories(catRes.data)
      } catch (e) {
        setDishes([])
        setCategories([])
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-12">Cargando...</div>
  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">TPV - Terminal Punto de Venta</h1>
        </div>
          {/* Botones de acción eliminados, ahora solo están en la tarjeta de ticket */}
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
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="input-field w-32" value={mesa} onChange={e => handleMesaChange(Number(e.target.value))}>
              {Array.from({length: 10}, (_, i) => (
                <option key={i+1} value={i+1}>Mesa {i+1}</option>
              ))}
            </select>
            <select className="input-field w-56" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Listado de productos con scroll */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingProducts ? (
                <div className="col-span-full text-center py-8">Cargando productos...</div>
              ) : (
                dishes
                  .filter(dish =>
                    (!selectedCategory || dish.categoryId === selectedCategory) &&
                    (!search || dish.name.toLowerCase().includes(search.toLowerCase()))
                  )
                  .map((dish) => (
                    <div key={dish.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                        {dish.image ? (
                          <img src={dish.image} alt={dish.name} className="w-12 h-12 object-cover rounded-full" />
                        ) : (
                          <span className="text-xl font-bold text-primary-600">🍽️</span>
                        )}
                      </div>
                      <div className="font-semibold mb-1 text-center text-sm">{dish.name}</div>
                      <div className="text-primary-600 font-bold mb-2 text-sm">€{dish.price.toFixed(2)}</div>
                      <button className="btn-primary w-full py-1 text-sm" onClick={() => handleAdd(dish)}>Añadir</button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: ticket con scroll y cabecera fija */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col h-2/3 min-h-[320px] max-h-[380px] relative">
            {/* Botones de acción en la esquina superior derecha, posición absoluta */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                className="rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg w-10 h-10 flex items-center justify-center text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  try {
                    await ticketsAPI.closeTicket(mesa);
                  } catch (e) {}
                  setTicket([]);
                  setTicketName(`Ticket Mesa ${mesa}`);
                }}
                title="Nuevo ticket"
              >
                <span role="img" aria-label="Nuevo ticket">➕</span>
              </button>
              <button
                className={`rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${ticket.length === 0 || isUpdating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                onClick={() => emitTicketUpdate()}
                disabled={ticket.length === 0 || isUpdating}
                title="Enviar ticket"
              >
                {isUpdating ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <span role="img" aria-label="Enviar">✉️</span>
                )}
              </button>
            </div>
            <div className="flex items-center mb-4 flex-shrink-0 gap-2">
              {editingName ? (
                <input
                  className="input-field text-base font-semibold mr-2 py-1 px-2 w-36"
                  value={ticketName}
                  onChange={e => setTicketName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  autoFocus
                  style={{ maxWidth: '9rem' }}
                />
              ) : (
                <h2 className="text-xl font-bold mr-2">{ticketName}</h2>
              )}
              <button
                className="text-neutral-500 hover:text-primary-600 text-xl p-1"
                onClick={() => setEditingName(true)}
                title="Editar nombre del ticket"
                style={{ lineHeight: 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path d="M15.232 5.232a2.5 2.5 0 0 1 0 3.536l-7.5 7.5A2.5 2.5 0 0 1 6.5 17H3a1 1 0 0 1-1-1v-3.5a2.5 2.5 0 0 1 .732-1.768l7.5-7.5a2.5 2.5 0 0 1 3.536 0zm-9.464 9.464a.5.5 0 0 0 .354.146H6.5v-1.232a.5.5 0 0 0-.146-.354l-1.232-1.232a.5.5 0 0 0-.354-.146H3.5v1.232a.5.5 0 0 0 .146.354l1.232 1.232z" />
                </svg>
              </button>
            </div>
            {/* Lista de productos en el ticket real */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {ticket.length === 0 ? (
                <div className="text-neutral-400 text-center py-8">No hay productos en el ticket</div>
              ) : (
                ticket.map((item, idx) => (
                  <div key={item.id + '-' + idx} className="grid grid-cols-[1fr,120px,60px] items-center gap-2">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="flex items-center gap-1 justify-center">
                      <button className="px-2 py-1 bg-neutral-100 rounded w-8" onClick={() => handleChangeQty(item.id, -1)}>-</button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button className="px-2 py-1 bg-neutral-100 rounded w-8" onClick={() => handleChangeQty(item.id, 1)}>+</button>
                      <button className="ml-2 text-red-500 hover:text-red-700 w-8" onClick={() => handleRemove(item.id)}>🗑️</button>
                    </div>
                    <div className="font-semibold text-sm text-right">€{(item.price*item.cantidad).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold flex-shrink-0">
              <span>Total:</span>
              <span className="text-primary-600">€{total.toFixed(2)}</span>
            </div>
            {/* ...el botón ahora está en la cabecera */}
          </div>
          {/* Cobro - Panel colapsable */}
          <div className="bg-white rounded-xl shadow-md flex-shrink-0">
            <button
              className="w-full flex items-center justify-between px-6 py-4 focus:outline-none"
              onClick={() => setCobroOpen(v => !v)}
              aria-expanded={cobroOpen}
            >
              <span className="text-lg font-semibold">Cobro</span>
              <span className="text-2xl">{cobroOpen ? '▲' : '▼'}</span>
            </button>
            {cobroOpen && (
              <div className="px-6 pb-6">
                <div className="mb-3 mt-2">
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TPV
