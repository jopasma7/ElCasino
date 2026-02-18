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
  // TODOS LOS HOOKS DEBEN IR AL PRINCIPIO
  const [ticketExpand, setTicketExpand] = useState(false);
  const socketRef = useRef(null);
  const [cobroOpen, setCobroOpen] = useState(false);
  const [platosOpen, setPlatosOpen] = useState(true);
  const [mesa, setMesa] = useState(1);
  const [ticket, setTicket] = useState([]);
  const [ticketsPorMesa, setTicketsPorMesa] = useState(Array(10).fill([]));
  const [ticketNamesPorMesa, setTicketNamesPorMesa] = useState(Array(10).fill('Ticket'));
  const [ticketName, setTicketName] = useState(`Ticket Mesa 1`);
  const [editingName, setEditingName] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDish, setModalDish] = useState(null);
  const { isAdmin, loading } = useAdmin();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // Estado para mostrar el modal de impresión
  const [showPrintModal, setShowPrintModal] = useState(false);

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
      // ...existing code...
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
      // ...existing code...

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
  // ...existing code...

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
        // Seleccionar la categoría 'Cafés' por defecto si existe
        const cafesCat = catRes.data.find(cat => cat.name.toLowerCase() === 'cafés');
        if (cafesCat) {
          setSelectedCategory(cafesCat.id);
        }
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

  // Función para imprimir el ticket en formato sencillo
  // Estado para mostrar el modal de impresión
  // ...existing code...
  // Llama a esta función para mostrar el modal
  const handlePrintTicket = () => {
    setShowPrintModal(true);
  };

  // Función que realmente imprime, según si se muestran precios o no
  const doPrintTicket = (showPrices) => {
    const ticketHtml = `
      <html>
      <head>
        <title>Ticket</title>
        <style>
          body {
            font-family: monospace;
            font-size: 14px;
            margin: 0;
            padding: 0;
            width: 58mm;
            max-width: 58mm;
            background: #fff;
          }
          .ticket-container {
            width: 58mm;
            max-width: 58mm;
            margin: 0 auto;
            padding: 4mm 2mm 2mm 2mm;
          }
          .ticket-header { text-align: center; font-weight: bold; margin-bottom: 8px; font-size: 16px; text-decoration: underline; }
          .ticket-line { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 14px; }
          .ticket-total { border-top: 1px dashed #000; margin-top: 8px; padding-top: 4px; font-weight: bold; font-size: 15px; }
          .print-btn { display: block; margin: 16px auto 0 auto; padding: 8px 24px; font-size: 15px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
          .close-btn { display: block; margin: 10px auto 0 auto; padding: 6px 18px; font-size: 14px; background: #e11d48; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
          @media print {
            html, body {
              width: 58mm !important;
              max-width: 58mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }
            .ticket-container {
              width: 58mm !important;
              max-width: 58mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-btn, .close-btn { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">${ticketName}</div>
          <div>
            ${ticket.map(item => `
              <div class="ticket-line">
                <span>${item.cantidad} x ${item.name}</span>
                ${showPrices ? `<span>€${(item.price * item.cantidad).toFixed(2)}</span>` : ''}
              </div>
              ${item.selectedOptions && item.selectedOptions.length > 0 ? item.selectedOptions.map(opt => opt.options && opt.options.length > 0 ? `
                <div style='font-size:13px; margin-left:10px;'>${opt.type}:<ul style='margin:0 0 4px 12px; padding:0;'>
                  ${opt.options.map(option => `<li style='list-style-type:disc; margin-left:8px;'>${option}</li>`).join('')}
                </ul></div>
              ` : '').join('') : ''}
            `).join('')}
          </div>
          ${showPrices ? `<div class="ticket-total">TOTAL: €${total.toFixed(2)}</div>` : ''}
          <div style="text-align:center; margin-top:10px;">¡Gracias!</div>
          <button class="print-btn" onclick="window.print()">Imprimir</button>
          <button class="close-btn" onclick="window.close()">Cerrar</button>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(ticketHtml);
    printWindow.document.close();
    printWindow.focus();
    setShowPrintModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabecera y controles */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            className="btn-primary px-6 py-2 text-lg"
            onClick={() => setPlatosOpen(v => !v)}
          >
            {platosOpen ? 'Ocultar platos' : 'Mostrar platos'}
          </button>
          <select className="input-field w-32" value={mesa} onChange={e => handleMesaChange(Number(e.target.value))}>
            {Array.from({length: 10}, (_, i) => (
              <option key={i+1} value={i+1}>Mesa {i+1}</option>
            ))}
          </select>
        </div>
        <h1 className="text-3xl font-bold whitespace-nowrap mt-4 md:mt-0">TPV - Terminal Punto de Venta</h1>
      </div>
      {/* Zona central mejorada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[70vh]">
        {/* Columna izquierda: filtros y productos */}
        <div className="flex flex-col h-full w-full">
            {/* Filtros de búsqueda y categoría dentro del panel colapsable */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Buscar producto o plato..."
                className="input-field flex-1"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="input-field w-56" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {/* Listado de productos colapsable */}
            <div className="flex-1 pr-1 max-h-[400px] overflow-y-auto">
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
                      <div
                        key={dish.id}
                        className="bg-white rounded-xl shadow flex flex-col items-stretch p-0 overflow-hidden border-2 transition-all duration-150 cursor-pointer hover:shadow-lg active:scale-95"
                        style={dish.customOptions && dish.customOptions.length > 0 ? { borderColor: '#f59e42' } : {}}
                        onClick={() => handleAdd(dish)}
                        title="Añadir al ticket"
                      >
                        <div className="w-full h-28 bg-neutral-100 flex items-center justify-center">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl font-bold text-primary-600">🍽️</span>
                          )}
                        </div>
                        <div className="font-semibold mb-3 text-center text-base px-4 pt-2 flex items-center justify-center gap-2">
                          {dish.name}
                          {dish.customOptions && dish.customOptions.length > 0 && (
                            <span title="Este plato tiene opciones personalizables" className="text-orange-500 text-lg">★</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        {/* Columna derecha: ticket con scroll y cabecera fija */}
        <div className="flex flex-col h-full w-full">
          <div
            className={`bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col relative text-base w-full h-full max-w-full overflow-x-auto`}
            style={{ fontSize: '1.08rem' }}
          >
            {/* Botones de acción en la esquina superior derecha, posición absoluta */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-10 h-10 flex items-center justify-center text-lg transition-all duration-200"
                onClick={() => setTicketExpand(true)}
                title="Expandir ticket"
              >
                <span role="img" aria-label="Expandir">⤢</span>
              </button>
              {/* Botón imprimir ticket */}
              <button
                className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg w-10 h-10 flex items-center justify-center text-lg transition-all duration-200"
                onClick={handlePrintTicket}
                title="Imprimir ticket"
              >
                {/* Icono SVG de impresora para máxima compatibilidad */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M6 19v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1v-7a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v7a1 1 0 0 0 1 1h2zm2 2v-4h8v4H8zm10-2v-2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-2zm-1-14V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2h10zm-2-2v2H8V3h8z"/>
                </svg>
              </button>
                          {/* Modal para elegir impresión con/sin precios */}
                          {showPrintModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
                                <h2 className="text-lg font-bold mb-4">¿Cómo quieres imprimir el ticket?</h2>
                                <button
                                  className="btn-primary w-full mb-3 py-2"
                                  onClick={() => doPrintTicket(true)}
                                >
                                  Imprimir <b>con precios</b>
                                </button>
                                <button
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold w-full py-2 rounded mb-2"
                                  onClick={() => doPrintTicket(false)}
                                >
                                  Imprimir <b>sin precios</b>
                                </button>
                                <button
                                  className="text-red-600 mt-2 underline"
                                  onClick={() => setShowPrintModal(false)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                    {/* Modal para ticket expandido */}
                    {ticketExpand && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 pt-36 pb-12">
                        <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col w-[80vw] max-w-[700px] h-[70vh] max-h-[700px] relative text-base">
                          <button
                            className="absolute top-4 right-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg w-10 h-10 flex items-center justify-center text-lg transition-all duration-200"
                            onClick={() => setTicketExpand(false)}
                            title="Cerrar ticket expandido"
                          >
                            <span role="img" aria-label="Cerrar">✖️</span>
                          </button>
                          {/* Copia del contenido del ticket, puedes reutilizar el mismo fragmento que tienes en el ticket normal */}
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
                        </div>
                      </div>
                    )}
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
                        <button className="ml-1 text-red-500 hover:text-red-700 w-7 flex items-center justify-center" onClick={() => handleRemove(item.id)} title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9zm1 2h4v1h-4V5zm-3 3h10v13H7V8zm2 3a1 1 0 0 1 2 0v7a1 1 0 1 1-2 0v-7zm4 0a1 1 0 0 1 2 0v7a1 1 0 1 1-2 0v-7z"/>
                          </svg>
                        </button>
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
          <div className="bg-white rounded-xl shadow-md flex-shrink-0 w-full">
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
