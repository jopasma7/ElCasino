import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Utensils, Clock } from 'lucide-react'
import { dailyMenuAPI, ordersAPI, userProfileAPI, dishesAPI } from '../services/api'

const Order = () => {
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('takeaway') // takeaway or dinein
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    notes: ''
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [dishes, setDishes] = useState([])
  const [dailyMenu, setDailyMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Selecciones del menú completo (2 platos)
  const [menuSelections, setMenuSelections] = useState({
    starter: '',
    main: '',
    dessert: ''
  })
  
  // Selección del menú completo (1 plato)
  const [completeSingleSelection, setCompleteSingleSelection] = useState({
    dish: '',
    dessert: ''
  })


  useEffect(() => {
    fetchDailyMenu()
    hydrateUserProfile()
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      const response = await dishesAPI.getAll()
      setDishes(response.data)
    } catch (error) {
      console.error('Error al cargar platos:', error)
      setDishes([])
    }
  }

  const fetchDailyMenu = async () => {
    try {
      const response = await dailyMenuAPI.getToday()
      setDailyMenu(response.data)
    } catch (error) {
      console.error('Error al cargar menú del día:', error)
      setDailyMenu(null)
    } finally {
      setLoading(false)
    }
  }

  const hydrateUserProfile = async () => {
    const token = localStorage.getItem('userToken')
    if (!token) return

    try {
      const response = await userProfileAPI.getMe()
      setCustomerInfo({
        name: response.data.name || '',
        phone: response.data.phone || '',
        notes: ''
      })
    } catch (error) {
      console.error('Error al cargar perfil:', error)
    }
  }

  // Función para normalizar nombres (sin tildes, minúsculas, sin espacios extra)
  const normalize = (str) => str
    ? str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
    : '';

  const addCompleteMenuToCart = () => {
    if (!menuSelections.starter || !menuSelections.main || !menuSelections.dessert) {
      toast.error('Por favor, selecciona un primero, un segundo y un postre')
      return
    }
    // Buscar los dishId por nombre normalizado
    const starterDish = dishes.find(d => normalize(d.name) === normalize(menuSelections.starter))
    const mainDish = dishes.find(d => normalize(d.name) === normalize(menuSelections.main))
    const dessertDish = dishes.find(d => normalize(d.name) === normalize(menuSelections.dessert))
    if (!starterDish || !mainDish || !dessertDish) {
      toast.error('No se pudo encontrar el plato seleccionado. Intenta recargar la página.')
      console.log('Platos cargados:', dishes.map(d => d.name));
      console.log('Seleccionados:', menuSelections);
      return
    }
    const menuItems = [
      { dishId: starterDish.id, quantity: 1, price: starterDish.price },
      { dishId: mainDish.id, quantity: 1, price: mainDish.price },
      { dishId: dessertDish.id, quantity: 1, price: dessertDish.price }
    ]
    setCart([...cart, {
      menuType: 'complete',
      name: 'Menú Completo',
      price: dailyMenu.price,
      quantity: 1,
      selections: {
        starter: menuSelections.starter,
        main: menuSelections.main,
        dessert: menuSelections.dessert
      },
      menuItems
    }])
    setMenuSelections({ starter: '', main: '', dessert: '' })
  }
  
  const addCompleteSingleToCart = () => {
    if (!completeSingleSelection.dish || !completeSingleSelection.dessert) {
      toast.error('Por favor, selecciona un plato y un postre')
      return
    }
    const dishObj = dishes.find(d => normalize(d.name) === normalize(completeSingleSelection.dish))
    const dessertObj = dishes.find(d => normalize(d.name) === normalize(completeSingleSelection.dessert))
    if (!dishObj || !dessertObj) {
      toast.error('No se pudo encontrar el plato seleccionado. Intenta recargar la página.')
      console.log('Platos cargados:', dishes.map(d => d.name));
      console.log('Seleccionados:', completeSingleSelection);
      return
    }
    const menuItems = [
      { dishId: dishObj.id, quantity: 1, price: dishObj.price },
      { dishId: dessertObj.id, quantity: 1, price: dessertObj.price }
    ]
    setCart([...cart, {
      menuType: 'complete-single',
      name: 'Menú Completo (1 Plato)',
      price: dailyMenu.completeSingleDishPrice,
      quantity: 1,
      selections: {
        dish: completeSingleSelection.dish,
        dessert: completeSingleSelection.dessert
      },
      menuItems
    }])
    setCompleteSingleSelection({ dish: '', dessert: '' })
  }

  const updateQuantity = (index, change) => {
    setCart(cart.map((item, i) => {
      if (i === index) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
      }
      return item
    }).filter(item => item !== null))
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  // El precio del menú es fijo, no la suma de los platos
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      toast.error('Por favor, añade el menú del día a tu pedido')
      return
    }

    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Por favor, completa tu información de contacto')
      return
    }



    try {
      setSubmitting(true)
      
      // Construir items con dishId para el backend
      let items = []
      cart.forEach(item => {
        if (item.menuItems) {
          item.menuItems.forEach(mi => {
            items.push({
              dishId: mi.dishId,
              quantity: mi.quantity,
              price: mi.price
            })
          })
        }
      })
      const orderData = {
        type: orderType,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        notes: customerInfo.notes || null,
        items,
        isDailyMenu: true
      }

      await ordersAPI.create(orderData)
      setOrderPlaced(true)
    } catch (error) {
      console.error('Error al realizar pedido:', error)
      toast.error('Error al realizar el pedido. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12">
        <div className="container mx-auto px-4 max-w-md text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              ¡Pedido Realizado!
            </h2>
            <p className="text-neutral-600 mb-6">
              ¡Hemos recibido tu pedido correctamente! Te esperamos en el restaurante para disfrutar de tu menú.
            </p>
            <button
              onClick={() => {
                setOrderPlaced(false)
                setCart([])
                setCustomerInfo({ name: '', phone: '', notes: '' })
                setMenuSelections({ starter: '', main: '', dessert: '' })
                setCompleteSingleSelection({ dish: '', dessert: '' })
              }}
              className="btn-primary w-full"
            >
              Hacer Otro Pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Hacer Pedido
          </h1>
          <p className="text-lg text-neutral-600">
            Pide nuestro delicioso menú del día
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Cargando menú del día...</p>
          </div>
        ) : !dailyMenu ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">No hay menú del día disponible</h2>
            <p className="text-neutral-600">Por favor, vuelve más tarde o contacta con el restaurante.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Options */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Menú del Día</h2>
                    <p className="text-sm text-neutral-600">Elige tu opción favorita</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Complete Menu */}
                  <div className="border-2 border-primary-200 rounded-xl p-6 bg-gradient-to-br from-primary-50 to-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Menú Completo (2 Platos)</h3>
                        <p className="text-sm text-neutral-600 mb-3">{dailyMenu.includes.join(' • ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600">€{dailyMenu.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Elige un Primero *
                        </label>
                        <select
                          value={menuSelections.starter}
                          onChange={(e) => setMenuSelections({ ...menuSelections, starter: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {dailyMenu.starters.map((starter, idx) => (
                            <option key={idx} value={starter}>{starter}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Elige un Segundo *
                        </label>
                        <select
                          value={menuSelections.main}
                          onChange={(e) => setMenuSelections({ ...menuSelections, main: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {dailyMenu.mains.map((main, idx) => (
                            <option key={idx} value={main}>{main}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                          Elige un Postre *
                        </label>
                        <select
                          value={menuSelections.dessert}
                          onChange={(e) => setMenuSelections({ ...menuSelections, dessert: e.target.value })}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="">Selecciona...</option>
                          {dailyMenu.desserts.map((dessert, idx) => (
                            <option key={idx} value={dessert}>{dessert}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={addCompleteMenuToCart}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Añadir Menú Completo (2 Platos)
                    </button>
                  </div>

                  {/* Complete Menu Single Dish */}
                  {dailyMenu.completeSingleDishPrice && (
                    <div className="border-2 border-primary-200 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-neutral-900 mb-2">Menú Completo (1 Plato)</h3>
                          <p className="text-sm text-neutral-600 mb-3">Primero o Segundo • Postre o Café • Pan y Bebida</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary-600">€{dailyMenu.completeSingleDishPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Elige un Plato (Primero o Segundo) *
                          </label>
                          <select
                            value={completeSingleSelection.dish}
                            onChange={(e) => setCompleteSingleSelection({ ...completeSingleSelection, dish: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="">Selecciona...</option>
                            <optgroup label="Primeros">
                              {dailyMenu.starters.map((starter, idx) => (
                                <option key={`cs-starter-${idx}`} value={starter}>{starter}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Segundos">
                              {dailyMenu.mains.map((main, idx) => (
                                <option key={`cs-main-${idx}`} value={main}>{main}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Elige un Postre *
                          </label>
                          <select
                            value={completeSingleSelection.dessert}
                            onChange={(e) => setCompleteSingleSelection({ ...completeSingleSelection, dessert: e.target.value })}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="">Selecciona...</option>
                            {dailyMenu.desserts.map((dessert, idx) => (
                              <option key={`cs-dessert-${idx}`} value={dessert}>{dessert}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={addCompleteSingleToCart}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Añadir Menú Completo (1 Plato)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart and Form */}
            <div className="space-y-6">
              {/* Cart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-semibold">Tu Pedido</h2>
                </div>

                {cart.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No hay productos en tu pedido
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-neutral-900">{item.name}</h3>
                            <p className="text-sm text-neutral-600">
                              €{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="p-1 hover:bg-neutral-200 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="p-1 hover:bg-neutral-200 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Show selections */}
                        {item.menuType === 'complete' && item.selections && (
                          <div className="text-xs text-neutral-500 mt-2 border-t border-neutral-200 pt-2">
                            <p>• <strong>Primero:</strong> {item.selections.starter}</p>
                            <p>• <strong>Segundo:</strong> {item.selections.main}</p>
                            <p>• <strong>Postre:</strong> {item.selections.dessert}</p>
                          </div>
                        )}
                        {item.menuType === 'complete-single' && item.selections && (
                          <div className="text-xs text-neutral-500 mt-2 border-t border-neutral-200 pt-2">
                            <p>• <strong>Plato:</strong> {item.selections.dish}</p>
                            <p>• <strong>Postre:</strong> {item.selections.dessert}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-primary-600">€{getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Form */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Información de Entrega</h2>
                
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tipo de Pedido
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          orderType === 'takeaway'
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        Para Llevar
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('dinein')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          orderType === 'dinein'
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        Comer en Restaurante
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Alergias, preferencias, etc."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cart.length === 0 || submitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Procesando...' : 'Realizar Pedido'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order
