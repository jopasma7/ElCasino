import React, { useState } from 'react';
import General from './pedidos/General';
import VistaPrevia from './pedidos/VistaPrevia';
import CrearPedido from './pedidos/CrearPedido';

const Pedidos = () => {
  const [activeTab, setActiveTab] = useState('crearPedido');

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'crearPedido' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-primary-700'}`}
          onClick={() => setActiveTab('crearPedido')}
        >
          Crear Pedido
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'general' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-primary-700'}`}
          onClick={() => setActiveTab('general')}
        >
          Pedidos Externos
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'vistaPrevia' ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-primary-700'}`}
          onClick={() => setActiveTab('vistaPrevia')}
        >
          Vista Previa
        </button>
      </div>
      {activeTab === 'general' && <General />}
      {activeTab === 'vistaPrevia' && <VistaPrevia />}
      {activeTab === 'crearPedido' && <CrearPedido />}
    </div>
  );
};

export default Pedidos;
