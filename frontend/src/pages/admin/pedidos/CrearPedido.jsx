import React, { useState, useEffect } from 'react';
import { dailyMenuAPI, ordersAPI } from '../../../services/api';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
const MySwal = withReactContent(Swal);

const CrearPedido = () => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('takeaway');
  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('');
  const [selectedPlatos, setSelectedPlatos] = useState({ primero: '', segundo: '' });
  const [cantidades, setCantidades] = useState({ primero: 1, segundo: 1 });
  // ...existing code...
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenuOptions();
  }, []);

  const fetchMenuOptions = async () => {
    try {
      setLoading(true);
      const res = await dailyMenuAPI.getToday();
      const menu = res.data.menu === undefined ? res.data : res.data.menu;
      if (!menu) {
        setMenuOptions([]);
        return;
      }
      const starters = Array.isArray(menu.starters) ? menu.starters.map(name => ({ type: 'primero', name })) : [];
      const mains = Array.isArray(menu.mains) ? menu.mains.map(name => ({ type: 'segundo', name })) : [];
      const desserts = Array.isArray(menu.desserts) ? menu.desserts.map(name => ({ type: 'postre', name })) : [];
      setMenuOptions([...starters, ...mains, ...desserts]);
    } catch (e) {
    // Validar que al menos uno esté seleccionado
    if (!selectedPlatos.primero && !selectedPlatos.segundo) {
      setLoading(false);
      setError('Debes seleccionar al menos un plato (Primero o Segundo)');
      return;
    }
      setMenuOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // No confirmación, solo crear y mostrar modal de éxito
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const items = [];
      if (selectedPlatos.primero) items.push({ dishName: selectedPlatos.primero, quantity: cantidades.primero });
      if (selectedPlatos.segundo) items.push({ dishName: selectedPlatos.segundo, quantity: cantidades.segundo });
      const response = await ordersAPI.createAdmin({
        customerName,
        isDailyMenu: true,
        items,
        status: 'accepted',
        type: orderType,
      });
      if (response && response.status === 201) {
        setSuccess('Pedido creado correctamente');
        setError('');
        setCustomerName('');
        setSelectedPlatos({ primero: '', segundo: '' });
        setCantidades({ primero: 1, segundo: 1 });
        MySwal.fire('¡Pedido creado!', 'El pedido ha sido registrado correctamente.', 'success');
      } else {
        setError('Error al crear pedido');
        setSuccess('');
      }
    } catch (e) {
      setError('Error al crear pedido');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-primary-700">Crear Pedido de Menú Diario</h2>
      <p className="text-neutral-600 mb-6">Registra aquí los pedidos de menú diario para clientes que llamen o reserven.</p>
      {menuOptions.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 font-semibold">
          ⚠️ No se ha definido el menú diario para hoy. Por favor, establece el menú antes de crear pedidos.
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 border border-neutral-200" disabled={(!menuOptions.length || menuOptions.filter(d => d.type === 'primero').length === 0 || menuOptions.filter(d => d.type === 'segundo').length === 0)}>
        {/* Fila 1: Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1 text-primary-700">Nombre</label>
            <input
              type="text"
              className="input-field w-full"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
              disabled={!menuOptions.length || menuOptions.filter(d => d.type === 'primero').length === 0 || menuOptions.filter(d => d.type === 'segundo').length === 0}
            />
          </div>
        </div>
        {/* Fila 2: Primer y Segundo Plato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1 text-primary-700">Primer Plato</label>
            <div className="flex gap-2">
              <select
                className="input-field w-full"
                value={selectedPlatos.primero}
                onChange={e => setSelectedPlatos(platos => ({ ...platos, primero: e.target.value }))}
                disabled={!menuOptions.length || menuOptions.filter(d => d.type === 'primero').length === 0}
              >
                <option value="">Selecciona...</option>
                {menuOptions.filter(d => d.type === 'primero').map(dish => (
                  <option key={dish.name} value={dish.name}>{dish.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="input-field w-20"
                value={cantidades.primero}
                onChange={e => setCantidades(c => ({ ...c, primero: Math.max(1, Number(e.target.value)) }))}
                disabled={!selectedPlatos.primero}
                placeholder="Cantidad"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1 text-primary-700">Segundo Plato</label>
            <div className="flex gap-2">
              <select
                className="input-field w-full"
                value={selectedPlatos.segundo}
                onChange={e => setSelectedPlatos(platos => ({ ...platos, segundo: e.target.value }))}
                disabled={!menuOptions.length || menuOptions.filter(d => d.type === 'segundo').length === 0}
              >
                <option value="">Selecciona...</option>
                {menuOptions.filter(d => d.type === 'segundo').map(dish => (
                  <option key={dish.name} value={dish.name}>{dish.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="input-field w-20"
                value={cantidades.segundo}
                onChange={e => setCantidades(c => ({ ...c, segundo: Math.max(1, Number(e.target.value)) }))}
                disabled={!selectedPlatos.segundo}
                placeholder="Cantidad"
              />
            </div>
          </div>
        </div>
        {/* Fila 3: Tipo de pedido */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-primary-700">Tipo de Pedido</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="orderType"
                value="takeaway"
                checked={orderType === 'takeaway'}
                onChange={() => setOrderType('takeaway')}
              />
              <span>Para llevar</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="orderType"
                value="dinein"
                checked={orderType === 'dinein'}
                onChange={() => setOrderType('dinein')}
              />
              <span>En restaurante</span>
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-2 py-2 px-4 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          disabled={loading || !menuOptions.length || menuOptions.filter(d => d.type === 'primero').length === 0 || menuOptions.filter(d => d.type === 'segundo').length === 0}
        >
          {loading ? 'Creando...' : 'Crear Pedido'}
        </button>
        {success && <div className="mt-2 text-green-600 font-medium">{success}</div>}
        {error && <div className="mt-2 text-red-600 font-medium">{error}</div>}
      </form>
    </div>
  );
};

export default CrearPedido;