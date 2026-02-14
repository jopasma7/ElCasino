import { Navigate } from 'react-router-dom'
import { useAdmin } from '../hooks/useAdmin'
import { dishesAPI, categoriesAPI } from '../services/api'
import { ticketsAPI } from '../services/ticketsAPI'
import { useEffect, useState, useRef } from 'react'
import DishOptionsModal from '../components/DishOptionsModal'
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
              cantidad: item.cantidad,
              selectedOptions: item.customOptions // <-- Añadido para mantener customOptions
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
                cantidad: item.cantidad,
                selectedOptions: item.customOptions // <-- Añadido para mantener customOptions
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
                  cantidad: item.cantidad,
                  selectedOptions: Array.isArray(item.customOptions) ? item.customOptions : []
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
              price: item.price,
              customOptions: item.selectedOptions || undefined
            }))
          };
          const res = await ticketsAPI.updateTicket(data.mesa, payload);
          // Actualizar ticket local con la respuesta del backend (opcional, pero recomendable)
          if (res.data && res.data.items) {
            setTicket(res.data.items.map(item => ({
              id: item.dishId,
              name: item.dish.name,
              price: item.price,
              cantidad: item.cantidad,
              selectedOptions: Array.isArray(item.customOptions) ? item.customOptions : []
            })));
          }
          // Emitir evento solo después de guardar, usando el ticket actualizado del backend
          socketRef.current.emit('updateTicket', {
            mesa: data.mesa,
            ticket: res.data.items,
            ticketName: res.data.name
          });
          toast.success('Ticket enviado correctamente', { position: 'top-right' });
        } catch (e) {
          toast.error('Error al enviar el ticket', { position: 'top-right' });
        } finally {
          setIsUpdating(false);
        }
      };

    // Añadir producto al ticket
      // Modal para customOptions
      const [modalOpen, setModalOpen] = useState(false);
      const [modalDish, setModalDish] = useState(null);

      // Añadir producto al ticket (con soporte para customOptions)
      const handleAdd = (dish) => {
        if (dish.customOptions && dish.customOptions.length > 0) {
          setModalDish(dish);
          setModalOpen(true);
        } else {
          setTicket(prev => {
            const idx = prev.findIndex(item => {
              const sameId = item.id === dish.id;
              const noOptions = !item.selectedOptions || item.selectedOptions.length === 0;
              return sameId && noOptions;
            });
            let updated;
            if (idx >= 0) {
              updated = [...prev];
              updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + 1 };
            } else {
              updated = [...prev, { ...dish, cantidad: 1 }];
            }
            return updated;
          });
        }
      };

      // Confirmar selección de opciones y añadir al ticket
      const handleConfirmOptions = (selectedOptions) => {
        if (!modalDish) return;
        setTicket(prev => {
          // Buscar si ya existe un plato igual con las mismas opciones
          const idx = prev.findIndex(item => item.id === modalDish.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions));
          let updated;
          if (idx >= 0) {
            updated = [...prev];
            updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + 1 };
          } else {
            updated = [...prev, { ...modalDish, cantidad: 1, selectedOptions }];
          }
          return updated;
        });
        setModalOpen(false);
        setModalDish(null);
      };

    // Modificar cantidad
      // Cambia la cantidad solo del item con el mismo id y mismas opciones personalizadas
      const handleChangeQty = (id, delta, selectedOptions) => {
        setTicket(prev => {
          const updated = prev.map(item => {
            const sameId = item.id === id;
            const sameOptions = JSON.stringify(item.selectedOptions || []) === JSON.stringify(selectedOptions || []);
            if (sameId && sameOptions) {
              return { ...item, cantidad: Math.max(1, item.cantidad + delta) };
            }
            return item;
          });
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
                    <div key={dish.id} className="bg-white rounded-xl shadow flex flex-col items-stretch p-0 overflow-hidden border-2 transition-all duration-150"
                      style={dish.customOptions && dish.customOptions.length > 0 ? { borderColor: '#f59e42' } : {}}>
                      <div className="w-full h-28 bg-neutral-100 flex items-center justify-center">
                        {dish.image ? (
                          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-primary-600">🍽️</span>
                        )}
                      </div>
                      <div className="font-semibold mb-1 text-center text-base px-4 pt-2 flex items-center justify-center gap-2">
                        {dish.name}
                        {dish.customOptions && dish.customOptions.length > 0 && (
                          <span title="Este plato tiene opciones personalizables" className="text-orange-500 text-lg">★</span>
                        )}
                      </div>
                      <div className="flex justify-center w-full mb-3 px-4">
                        <button className="btn-primary w-full py-1 text-sm" onClick={() => handleAdd(dish)}>
                          Añadir
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: ticket con scroll y cabecera fija */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col h-[85%] min-h-[420px] max-h-[600px] relative text-base" style={{ fontSize: '1.08rem', minWidth: '420px', maxWidth: '520px', width: '100%' }}>
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
                  <div key={item.id + '-' + idx} className="mb-2">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="font-medium text-sm truncate flex-1 min-w-0">
                        {item.name}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="mt-1 mb-1 pl-2 text-xs font-mono">
                            {item.selectedOptions.map(opt => (
                              opt.options && opt.options.length > 0 ? (
                                <div key={opt.type} className="mb-1">
                                  <div className="font-semibold text-orange-700">{opt.type}:</div>
                                  <ul className="ml-3 list-none">
                                    {opt.options.map(option => (
                                      <li key={option} className="text-neutral-800">- {option}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="px-1 py-1 bg-neutral-100 rounded w-7" onClick={() => handleChangeQty(item.id, -1, item.selectedOptions)}>-</button>
                        <span className="w-7 text-center">{item.cantidad}</span>
                        <button className="px-1 py-1 bg-neutral-100 rounded w-7" onClick={() => handleChangeQty(item.id, 1, item.selectedOptions)}>+</button>
                        <button className="ml-1 text-red-500 hover:text-red-700 w-7" onClick={() => handleRemove(item.id)}>🗑️</button>
                        <div className="font-semibold text-sm text-right min-w-[60px] ml-2">€{(item.price*item.cantidad).toFixed(2)}</div>
                      </div>
                    </div>
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
      {/* Modal para opciones de plato */}
      <DishOptionsModal
        dish={modalDish}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalDish(null); }}
        onConfirm={handleConfirmOptions}
      />
    </div>
  )
}

export default TPV
