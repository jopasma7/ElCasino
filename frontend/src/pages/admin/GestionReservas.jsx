import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservasAPI } from '../../services/api';

import { BadgeCheck, XCircle, Clock } from 'lucide-react';


const tipos = {
  almuerzo: 'Almuerzo',
  comida: 'Comida',
  cena: 'Cena'
};

const estados = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada'
};

function GestionReservas() {
  // Eliminado filtro de estado
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Calendario personalizado
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cantidadPersonas: 2,
    tipo: 'comida',
    comentarios: '',
    fechaReserva: ''
  });

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await reservasAPI.getAll();
      setReservas(res.data);
    } catch (error) {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await reservasAPI.updateEstado(id, estado);
      toast.success('Reserva actualizada');
      fetchReservas();
    } catch (error) {
      toast.error('Error al actualizar reserva');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-4xl font-extrabold mb-3 text-primary-700 font-display drop-shadow" tabIndex={0} aria-label="Gestión de Reservas">
        <span className="inline-block mr-2" aria-hidden="true">🗓️</span>Gestión de Reservas del Restaurante
      </h2>
      <div className="mb-8">
        <p className="text-lg text-primary-800 bg-primary-50 rounded-xl p-4 shadow border border-primary-100 w-full text-left">
          En esta sección puedes consultar, crear y gestionar todas las reservas realizadas por los clientes. Utiliza el calendario para ver las reservas de cada día, aprobar o rechazar solicitudes y llevar un control eficiente de la ocupación del restaurante.
        </p>
      </div>
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:gap-6">
        {/* Bloque profesional a la izquierda */}
        <div className="w-full md:w-80 mb-6 md:mb-0 flex-shrink-0">
          <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 rounded-xl shadow-lg p-6 text-white border-2 border-primary-500/40 mb-6 flex flex-col items-center">
            <img src="/logo192.png" alt="El Casino" className="w-16 h-16 rounded-full mb-3 border-4 border-primary-200 shadow" />
            <h2 className="text-2xl font-extrabold mb-1 font-display tracking-tight drop-shadow">Panel de Reservas</h2>
            <p className="text-base font-semibold text-primary-50 drop-shadow-sm text-center mb-2">Gestiona y consulta todas las reservas del restaurante de forma ágil y profesional.</p>
            <div className="w-full mt-2 mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Fecha seleccionada:</span>
                <span className="font-bold">{selectedDate ? (new Date(selectedDate).toLocaleDateString('es-ES')) : '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Total reservas:</span>
                <span className="font-bold">{reservas.filter(r => r.fechaReserva.split('T')[0] === selectedDate).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Personas reservadas:</span>
                <span className="font-bold">{reservas.filter(r => r.fechaReserva.split('T')[0] === selectedDate).reduce((acc, r) => acc + r.cantidadPersonas, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Aprobadas:</span>
                <span className="font-bold">{reservas.filter(r => r.fechaReserva.split('T')[0] === selectedDate && r.estado === 'aprobada').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Pendientes:</span>
                <span className="font-bold">{reservas.filter(r => r.fechaReserva.split('T')[0] === selectedDate && r.estado === 'pendiente').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Rechazadas:</span>
                <span className="font-bold">{reservas.filter(r => r.fechaReserva.split('T')[0] === selectedDate && r.estado === 'rechazada').length}</span>
              </div>
            </div>
            <div className="w-full mt-4">
              <h3 className="text-sm font-bold mb-2 text-primary-100">Leyenda de colores</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/80 text-white font-semibold"><span className="w-2 h-2 rounded-full bg-green-200 border border-white"></span> Aprobada</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-400/80 text-white font-semibold"><span className="w-2 h-2 rounded-full bg-yellow-100 border border-white"></span> Pendiente</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/80 text-white font-semibold"><span className="w-2 h-2 rounded-full bg-red-200 border border-white"></span> Rechazada</span>
              </div>
            </div>
          </div>
        </div>
        {/* Calendario personalizado */}
        <div className="relative w-full max-w-xl flex flex-col items-center">
          <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{
            background: 'linear-gradient(135deg, #fbcf8b 0%, #f79f17 40%, #a66a06 100%)',
            opacity: 0.18,
            filter: 'blur(6px)'
          }} />
          <div className="bg-white rounded-2xl p-8 w-full shadow-2xl border border-neutral-200 relative z-10">
              <h2 className="text-2xl font-bold mb-4 text-center text-primary-700">Calendario</h2>
            <div className="w-full flex flex-col items-center text-base">
            <div className="flex items-center justify-between w-full mb-2">
              <button
                className="px-2 py-1 rounded hover:bg-primary-100 text-primary-700"
                onClick={() => {
                  if (month === 0) {
                    setMonth(11);
                    setYear(year - 1);
                  } else {
                    setMonth(month - 1);
                  }
                }}
                type="button"
              >
                &lt;
              </button>
              <span className="font-semibold text-primary-800">
                {new Date(year, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase())}
              </span>
              <button
                className="px-2 py-1 rounded hover:bg-primary-100 text-primary-700"
                onClick={() => {
                  if (month === 11) {
                    setMonth(0);
                    setYear(year + 1);
                  } else {
                    setMonth(month + 1);
                  }
                }}
                type="button"
              >
                &gt;
              </button>
            </div>
              <table className="w-full text-center select-none text-lg md:text-xl">
              <thead>
                <tr>
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(dia => (
                    <th key={dia} className="py-1 text-secondary-600 font-medium">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const hoy = new Date();
                  const primerDia = new Date(year, month, 1);
                  const primerDiaSemana = (primerDia.getDay() + 6) % 7; // Lunes=0
                  const diasEnMes = new Date(year, month + 1, 0).getDate();
                  let dias = [];
                  let semana = [];
                  for (let i = 0; i < primerDiaSemana; i++) semana.push(null);
                  for (let d = 1; d <= diasEnMes; d++) {
                    semana.push(d);
                    if (semana.length === 7) {
                      dias.push(semana);
                      semana = [];
                    }
                  }
                  if (semana.length) {
                    while (semana.length < 7) semana.push(null);
                    dias.push(semana);
                  }
                  return dias.map((sem, i) => (
                    <tr key={i}>
                      {sem.map((dia, j) => {
                        const fechaStr = dia ? `${year}-${String(month+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}` : '';
                        const isToday = dia && fechaStr === hoy.toISOString().split('T')[0];
                        // Resaltar días con reservas
                        const reservasDia = dia ? reservas.filter(r => r.fechaReserva.split('T')[0] === fechaStr) : [];
                        // Determinar qué estados hay presentes ese día
                        const estadosDia = {
                          aprobada: reservasDia.some(r => r.estado === 'aprobada'),
                          pendiente: reservasDia.some(r => r.estado === 'pendiente'),
                          rechazada: reservasDia.some(r => r.estado === 'rechazada'),
                        };
                        return (
                            <td key={j}
                              className={`group p-0 align-middle`}
                              style={{ verticalAlign: 'middle' }}
                              onClick={() => {
                                if (dia) {
                                  setSelectedDate(fechaStr);
                                  setForm(f => ({ ...f, fechaReserva: fechaStr }));
                                }
                              }}
                            >
                              {dia ? (
                                <div
                                  className={`flex flex-col items-center justify-center w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full transition-all duration-150 cursor-pointer
                                      ${selectedDate === fechaStr ? 'bg-blue-600 text-white font-bold shadow-md border-2 border-blue-500' : isToday ? 'text-primary-700 font-semibold border border-neutral-200' : 'hover:bg-neutral-100 text-primary-800'}
                                    `}
                                    style={{
                                      border:
                                        reservasDia.length > 0 && selectedDate !== fechaStr
                                          ? `2px solid ${
                                              estadosDia.aprobada
                                                ? '#22c55e'
                                                : estadosDia.pendiente
                                                ? '#eab308'
                                                : '#ef4444'
                                            }`
                                          : undefined,
                                      boxShadow: selectedDate === fechaStr ? '0 2px 12px 0 #60a5fa33' : undefined
                                    }}
                                >
                                  <span className="text-lg md:text-xl select-none" style={{lineHeight: 1.1}}>{dia}</span>
                                  {/* Puntos de estado múltiples */}
                                  <div className="flex gap-1 mt-1 h-2">
                                    {estadosDia.aprobada && <span className="w-2 h-2 rounded-full bg-green-500 block" title="Aprobada"></span>}
                                    {estadosDia.pendiente && <span className="w-2 h-2 rounded-full bg-yellow-400 block" title="Pendiente"></span>}
                                    {estadosDia.rechazada && <span className="w-2 h-2 rounded-full bg-red-500 block" title="Rechazada"></span>}
                                  </div>
                                </div>
                              ) : ''}
                            </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-secondary-600">Haz clic en un día para ver/crear reservas</div>
          </div>
          </div>
        </div>
        {/* Filtro por estado eliminado */}
      </div>
      {selectedDate && (
        <div className="mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary-700">Reservas para {(new Date(selectedDate)).toLocaleDateString('es-ES')}</h3>
            <button
              className="btn-primary px-4 py-2 rounded-lg font-bold shadow hover:bg-primary-700 transition"
              style={{ minWidth: 120 }}
              onClick={() => setShowForm(true)}
            >Añadir</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservas
              .filter(r => r.fechaReserva.split('T')[0] === selectedDate)
              .length === 0 ? (
                <div className="text-neutral-500 col-span-full">No hay reservas para este día.</div>
              ) : (
                reservas
                  .filter(r => r.fechaReserva.split('T')[0] === selectedDate)
                  .map(r => (
                    <div key={r.id} className={`rounded-2xl shadow-lg p-6 bg-white border-2 flex flex-col gap-2 ${r.estado === 'aprobada' ? 'border-green-500' : r.estado === 'rechazada' ? 'border-red-500' : 'border-yellow-400'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {r.estado === 'aprobada' && <BadgeCheck className="text-green-500 w-6 h-6" title="Aprobada" />}
                        {r.estado === 'rechazada' && <XCircle className="text-red-500 w-6 h-6" title="Rechazada" />}
                        {r.estado === 'pendiente' && <Clock className="text-yellow-400 w-6 h-6" title="Pendiente" />}
                        <span className="font-bold text-xl text-primary-800 tracking-tight">{tipos[r.tipo]}</span>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold shadow ${r.estado === 'aprobada' ? 'bg-green-100 text-green-700' : r.estado === 'rechazada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{estados[r.estado]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base">
                        <span className="font-medium text-primary-700">👤 Usuario:</span>
                        <span className="font-semibold text-primary-900">{r.user?.name || r.userId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base">
                        <span className="font-medium text-primary-700">👥 Personas:</span>
                        <span className="font-semibold text-primary-900">{r.cantidadPersonas}</span>
                      </div>
                      {r.comentarios && <div className="text-sm text-neutral-600 mt-2 italic border-l-4 border-primary-200 pl-3">{r.comentarios}</div>}
                      {r.estado === 'pendiente' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            className="btn-primary"
                            onClick={() => handleEstado(r.id, 'aprobada')}
                          >Aprobar</button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEstado(r.id, 'rechazada')}
                          >Rechazar</button>
                        </div>
                      )}
                    </div>
                  ))
              )}
          </div>
        </div>
      )}
      {/* Modal para crear reserva */}
      {showForm && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-primary-200 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-primary-700 hover:text-red-600 text-2xl font-bold"
              onClick={() => setShowForm(false)}
              aria-label="Cerrar"
            >×</button>
            <h3 className="text-xl font-semibold mb-4 text-primary-700">Crear nueva reserva para {(new Date(selectedDate)).toLocaleDateString('es-ES')}</h3>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  await reservasAPI.create({
                    fechaReserva: form.fechaReserva,
                    cantidadPersonas: form.cantidadPersonas,
                    tipo: form.tipo,
                    comentarios: form.comentarios
                  });
                  toast.success('Reserva creada correctamente');
                  setForm({ cantidadPersonas: 2, tipo: 'comida', comentarios: '', fechaReserva: form.fechaReserva });
                  fetchReservas();
                  setShowForm(false);
                } catch {
                  toast.error('Error al crear reserva');
                }
              }}
              className=""
            >
              <div className="mb-4">
                <label className="block mb-2 font-medium">Cantidad de personas</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.cantidadPersonas}
                  onChange={e => setForm(f => ({ ...f, cantidadPersonas: Number(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Tipo de comida</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  className="input"
                  required
                >
                  {Object.entries(tipos).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Comentarios</label>
                <textarea
                  value={form.comentarios}
                  onChange={e => setForm(f => ({ ...f, comentarios: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>
              <button type="submit" className="btn-primary w-full">Crear reserva</button>
            </form>
          </div>
          {/* Animación modal */}
          <style>{`
            .animate-fade-in {
              animation: fadeInModal 0.25s ease;
            }
            @keyframes fadeInModal {
              from { opacity: 0; transform: scale(0.97); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default GestionReservas;
