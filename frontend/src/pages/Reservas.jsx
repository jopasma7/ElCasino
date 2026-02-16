import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservasAPI } from '../services/api';
import { useAdmin } from '../hooks/useAdmin';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

const tipos = [
  { value: 'almuerzo', label: 'Almuerzo' },
  { value: 'comida', label: 'Comida' },
  { value: 'cena', label: 'Cena' }
];

function Reservas() {
  // Estado para edición de reserva
  const [editReserva, setEditReserva] = useState(null); // reserva a editar o null
  const [editForm, setEditForm] = useState({ fecha: '', personas: 2, tipo: 'comida', comentarios: '' });
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [fecha, setFecha] = useState('');
  const [personas, setPersonas] = useState(2);
  const [tipo, setTipo] = useState('comida');
  const [comentarios, setComentarios] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenReciente, setOrdenReciente] = useState('reciente');

  useEffect(() => {
    fetchMisReservas();
  }, []);

  const fetchMisReservas = async () => {
    setLoading(true);
    try {
      const res = await reservasAPI.getMis();
      setReservas(res.data);
    } catch (error) {
      toast.error('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios de edición (debe estar fuera de handleSubmit)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.fecha) {
      toast.error('Selecciona una fecha');
      return;
    }
    // Chequeo: ¿ya existe otra reserva para ese día?
    const yaReservada = reservas.some(r => {
      const fechaR = r.fechaReserva.split('T')[0];
      return r.id !== editReserva.id && fechaR === editForm.fecha && r.tipo === editForm.tipo;
    });
    if (yaReservada) {
      toast.error('Ya tienes otra reserva para ese día.');
      return;
    }
    try {
      await reservasAPI.update(editReserva.id, {
        fechaReserva: editForm.fecha,
        cantidadPersonas: editForm.personas,
        tipo: editForm.tipo,
        comentarios: editForm.comentarios
      });
      toast.success('Reserva actualizada correctamente');
      setEditReserva(null);
      fetchMisReservas();
    } catch {
      toast.error('Error al actualizar la reserva');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) {
      toast.error('Selecciona una fecha');
      return;
    }
    // Chequeo: ¿ya existe una reserva para ese día y tipo?
    const yaReservada = reservas.some(r => {
      const fechaR = r.fechaReserva.split('T')[0];
      return fechaR === fecha && r.tipo === tipo;
    });
    if (yaReservada) {
      toast.error('Ya tienes una reserva para ese día. Puedes editarla desde tus reservas.');
      return;
    }
    try {
      await reservasAPI.create({
        fechaReserva: fecha,
        cantidadPersonas: personas,
        tipo,
        comentarios
      });
      toast.success('Reserva solicitada correctamente');
      setFecha('');
      setPersonas(2);
      setTipo('comida');
      setComentarios('');
      fetchMisReservas();
    } catch (error) {
      toast.error('Error al solicitar reserva');
    }
  };

  // Filtrar y ordenar reservas antes del render
  const reservasFiltradas = reservas
    .filter(r => filtroEstado === 'todas' ? true : r.estado === filtroEstado)
    .sort((a, b) => {
      const fechaA = new Date(a.fechaReserva);
      const fechaB = new Date(b.fechaReserva);
      // Corregido: 'reciente' primero las fechas más nuevas
      return ordenReciente === 'reciente' ? fechaA - fechaB : fechaB - fechaA;
    });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-secondary-50 py-8">
      {/* Texto profesional de introducción, equilibrado y conciso */}
      <div className="w-full max-w-5xl mb-8">
        <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 rounded-xl shadow-lg p-6 text-white text-center border-2 border-primary-500/40">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2 font-display tracking-tight drop-shadow">Panel de Reservas</h2>
          <p className="text-lg md:text-xl font-semibold text-primary-50 drop-shadow-sm">
            Gestiona y consulta tus reservas en El Casino de forma ágil y segura. Solicita nuevas reservas, revisa su estado y mantén el control de tus próximas visitas.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        {/* Formulario de reserva */}
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary-700">Reserva tu mesa</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-primary-800 font-medium mb-2">Fecha de reserva*</label>
              <input
                type="date"
                name="fecha"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full border border-primary-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-primary-800 font-medium mb-1">Personas*</label>
                <select name="personas" value={personas} onChange={e => setPersonas(Number(e.target.value))} className="w-full border border-primary-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400">
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-primary-800 font-medium mb-1">Tipo de reserva*</label>
                <div className="flex gap-2 mt-1">
                  {tipos.map(t => (
                    <label key={t.value} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="tipo"
                        value={t.value}
                        checked={tipo === t.value}
                        onChange={() => setTipo(t.value)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-primary-800 font-medium mb-1">Comentarios</label>
              <textarea name="comentarios" value={comentarios} onChange={e => setComentarios(e.target.value)} className="w-full border border-primary-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" rows={2} placeholder="¿Alguna petición especial?" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2 px-4 rounded shadow transition border-2 border-primary-500/40">
              Confirmar reserva
            </button>
          </form>
        </div>
        {/* Calendario visual */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary-700">Calendario</h2>
        <div className="w-full flex flex-col items-center">
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
          <table className="w-full text-center select-none">
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
                      return (
                        <td key={j} className={`py-1 px-2 rounded-lg cursor-pointer transition-all
                          ${dia ? (fecha === fechaStr ? 'bg-primary-600 text-white font-bold' : isToday ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-primary-50') : ''}`}
                          onClick={() => dia && setFecha(fechaStr)}
                        >
                          {dia || ''}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-secondary-600">Haz clic en un día para seleccionarlo</div>
        </div>
      </div>
      </div>
      {reservas.length > 0 && (
        <div className="w-full max-w-5xl mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-primary-700">Mis reservas</h3>
          {/* Filtros de estado y orden solo si hay reservas */}
          {reservas.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-primary-700 mr-2">Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  className="border border-primary-200 rounded px-2 py-1"
                >
                  <option value="todas">Todas</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-primary-700 mr-2">Orden:</label>
                <select
                  value={ordenReciente}
                  onChange={e => setOrdenReciente(e.target.value)}
                  className="border border-primary-200 rounded px-2 py-1"
                >
                  <option value="reciente">Más reciente</option>
                  <option value="antiguo">Más antiguo</option>
                </select>
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-primary-700">Cargando...</div>
        ) : reservas.length === 0 ? (
          null
        ) : (
          <>
            <div className={reservasFiltradas.length > 3 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"} style={{ scrollbarGutter: 'stable' }}>
              {reservasFiltradas.map(r => {
                let estadoColor = r.estado === 'aprobada' ? 'bg-green-100 text-green-700' : r.estado === 'rechazada' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                let estadoIcon = r.estado === 'aprobada' ? '✔️' : r.estado === 'rechazada' ? '❌' : '⏳';
                const fechaObj = new Date(r.fechaReserva);
                const fechaLarga = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                const fechaLargaConAnio = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                const tipoLabel = tipos.find(t => t.value === r.tipo)?.label || r.tipo;
                let mensaje = '';
                if (r.estado === 'aprobada') mensaje = '¡Gracias por reservar! Te esperamos.';
                else if (r.estado === 'pendiente') mensaje = 'Te avisaremos cuando tu reserva sea confirmada.';
                else if (r.estado === 'rechazada') mensaje = 'Lamentamos que tu reserva no haya sido aprobada.';
                return (
                  <div key={r.id} className="card p-5 flex flex-col gap-2 border border-primary-100 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xl font-bold ${estadoColor}`}>{estadoIcon}</span>
                      <span className="font-bold text-primary-800 text-lg">{fechaLarga}</span>
                      {r.estado === 'pendiente' && (
                        <div className="ml-auto flex gap-2">
                          <button
                            className="text-primary-700 hover:text-primary-900 underline text-xs font-semibold"
                            onClick={() => {
                              setEditReserva(r);
                              setEditForm({
                                fecha: r.fechaReserva.split('T')[0],
                                personas: r.cantidadPersonas,
                                tipo: r.tipo,
                                comentarios: r.comentarios || ''
                              });
                            }}
                          >Editar</button>
                          <button
                            className="text-red-600 hover:text-red-800 underline text-xs font-semibold"
                            onClick={async () => {
                              const result = await MySwal.fire({
                                title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar reserva?</span>',
                                html: '<div style="color:#444">¿Seguro que quieres eliminar esta reserva? <br><b>Esta acción no se puede deshacer.</b></div>',
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
                                await reservasAPI.delete(r.id);
                                toast.success('Reserva eliminada');
                                fetchMisReservas();
                              } catch {
                                toast.error('Error al eliminar la reserva');
                              }
                            }}
                          >Eliminar</button>
                        </div>
                      )}
                    </div>
                    <div className="text-primary-700 font-semibold text-base">Reserva para {r.cantidadPersonas} persona{r.cantidadPersonas > 1 ? 's' : ''} ({tipoLabel})</div>
                    <div className="text-sm text-primary-900">Estado: <span className={`font-semibold px-2 py-1 rounded ${estadoColor}`}>{r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</span></div>
                    <div className="text-sm text-secondary-800 mt-1">Tu reserva para {r.cantidadPersonas} persona{r.cantidadPersonas > 1 ? 's' : ''} el {fechaLargaConAnio} para {tipoLabel} está <span className="font-semibold">{r.estado}</span>.</div>
                    {r.comentarios && <div className="mt-2 text-secondary-700 text-xs italic">Comentario: {r.comentarios}</div>}
                    <div className="mt-2 text-xs text-primary-700 font-medium">{mensaje}</div>
                  </div>
                );
              })}
              {/* Modal de edición de reserva fuera del map */}
              {editReserva && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all animate-fade-in">
                  <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 rounded-3xl shadow-2xl p-0 max-w-lg w-full border border-primary-200 relative overflow-hidden">
                    {/* Header con icono y botón cerrar */}
                    <div className="flex items-center justify-between px-8 pt-7 pb-3 border-b border-primary-100 bg-gradient-to-r from-primary-700/90 to-primary-600/90">
                      <div className="flex flex-col gap-0.5 items-start">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-2xl shadow"><svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-7 h-7'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg></span>
                          <h3 className="text-2xl font-bold text-primary-50 drop-shadow">Editar reserva</h3>
                        </div>
                        <p className="text-primary-100 text-sm mt-1 ml-1">Modifica la fecha, cantidad de personas o comentarios de tu reserva pendiente.</p>
                      </div>
                      <button
                        className="text-primary-100 hover:text-red-300 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full px-2 transition"
                        onClick={() => setEditReserva(null)}
                        aria-label="Cerrar"
                        tabIndex={0}
                      >×</button>
                    </div>
                    {/* Formulario */}
                    <form onSubmit={handleEditSubmit} className="px-8 py-7">
                      <div className="mb-5">
                        <label className="block mb-2 font-semibold text-primary-700">Fecha de reserva</label>
                        <input
                          type="date"
                          value={editForm.fecha}
                          onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                          className="w-full border border-primary-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-primary-800 bg-white shadow-sm"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="mb-5">
                        <label className="block mb-2 font-semibold text-primary-700">Cantidad de personas</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={editForm.personas}
                          onChange={e => setEditForm(f => ({ ...f, personas: Number(e.target.value) }))}
                          className="w-full border border-primary-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-primary-800 bg-white shadow-sm"
                          required
                        />
                      </div>
                      <div className="mb-5">
                        <label className="block mb-2 font-semibold text-primary-700">Tipo de reserva</label>
                        <div className="flex gap-4 mt-1">
                          {tipos.map(t => (
                            <label key={t.value} className="flex items-center gap-2 text-primary-700 font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="editTipo"
                                value={t.value}
                                checked={editForm.tipo === t.value}
                                onChange={() => setEditForm(f => ({ ...f, tipo: t.value }))}
                                className="accent-primary-600 w-4 h-4"
                              />
                              {t.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mb-7">
                        <label className="block mb-2 font-semibold text-primary-700">Comentarios</label>
                        <textarea
                          value={editForm.comentarios}
                          onChange={e => setEditForm(f => ({ ...f, comentarios: e.target.value }))}
                          className="w-full border border-primary-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-primary-800 bg-white shadow-sm"
                          rows={3}
                          placeholder="¿Alguna petición especial?"
                        />
                      </div>
                      <button type="submit" className="w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 hover:from-primary-800 hover:to-primary-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg transition border-2 border-primary-500/40 text-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-400">
                        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-6 h-6'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                        Guardar cambios
                      </button>
                    </form>
                  </div>
                  <style>{`
                    .animate-fade-in {
                      animation: fadeInModal 0.25s cubic-bezier(.4,1.6,.6,1);
                    }
                    @keyframes fadeInModal {
                      from { opacity: 0; transform: scale(0.97) translateY(20px); }
                      to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                  `}</style>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      )}   
    </div>
  );
}

export default Reservas;
