import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react'
import { dishesAPI, ordersAPI } from '../services/api'

const Order = () => {
  const [cart, setCart] = useState([])
  const [orderType, setOrderType] = useState('takeaway') // takeaway or delivery
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [availableItems, setAvailableItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAvailableItems()
  }, [])

  const fetchAvailableItems = async () => {
    try {
      const response = await dishesAPI.getAll({ available: true })
      setAvailableItems(response.data)
    } catch (error) {
      console.error('Error al cargar platos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Por favor, añade productos a tu pedido')
      return
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Por favor, completa tu información de contacto')
      return
    }

    if (orderType === 'delivery' && !customerInfo.address) {
      alert('Por favor, indica tu dirección de entrega')
      return
    }

    try {
      setSubmitting(true)
      
      const orderData = {
        type: orderType,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: orderType === 'delivery' ? customerInfo.address : null,
        notes: customerInfo.notes || null,
        items: cart.map(item => ({
          dishId: item.id,
          quantity: item.quantity
        }))
      }

      await ordersAPI.create(orderData)
      setOrderPlaced(true)
    } catch (error) {
      console.error('Error al realizar pedido:', error)
      alert('Error al realizar el pedido. Inténtalo de nuevo.')
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
              Hemos recibido tu pedido correctamente. Te llamaremos al teléfono indicado para confirmar.
            </p>
            <button
              onClick={() => {
                setOrderPlaced(false)
                setCart([])
                setCustomerInfo({ name: '', phone: '', address: '', notes: '' })
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
            Selecciona tus platos favoritos y te los preparamos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Productos Disponibles</h2>
              <div className="space-y-3">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-500 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-600">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-primary-600">
                        €{item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
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
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">{item.name}</h3>
                        <p className="text-sm text-neutral-600">
                          €{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-neutral-200 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-neutral-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                      Recoger
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        orderType === 'delivery'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      Domicilio
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

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                )}

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
      </div>
    </div>
  )
}

export default Order
