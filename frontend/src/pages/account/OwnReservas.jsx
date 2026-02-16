import React from 'react';

const OwnReservas = ({ reservas }) => {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <h3 className="text-2xl font-bold text-neutral-900">Mis Reservas</h3>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-neutral-400">
          <span className="font-semibold text-neutral-900">Reservas</span>
          <span className="w-12 h-px bg-neutral-200" />
          <span>Historial</span>
        </div>
      </div>
      <p className="text-neutral-500 mb-5 text-sm">Aquí puedes consultar el historial y estado de tus reservas realizadas en El Casino. Si tienes alguna duda o necesitas modificar una reserva, contacta con nuestro equipo.</p>
      {reservas && reservas.length > 0 ? (
        <div
          className={`space-y-4 ${reservas.length > 4 ? 'max-h-80 overflow-y-auto pr-2' : ''}`}
          style={{ scrollbarGutter: 'stable' }}
        >
          {reservas.map((reserva, idx) => {
            let fecha = reserva.fechaReserva ? new Date(reserva.fechaReserva) : null;
            let fechaStr = fecha ? fecha.toLocaleDateString() : '-';
            return (
              <div
                key={reserva.id || idx}
                className="flex items-center justify-between gap-4 border border-neutral-200 rounded-lg px-4 py-2 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-700 text-base">{fechaStr}</span>
                    <span className="text-xs text-neutral-400">|</span>
                    <span className="text-sm text-neutral-700">{reserva.cantidadPersonas} {reserva.cantidadPersonas === 1 ? 'persona' : 'personas'}</span>
                    <span className="text-xs text-neutral-400">|</span>
                    <span className="text-sm text-neutral-700 capitalize">{reserva.tipo}</span>
                    {reserva.estado && (
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${reserva.estado === 'aprobada' ? 'bg-green-100 text-green-700' : reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{reserva.estado}</span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    ¡Gracias por confiar en nosotros! Te esperamos en El Casino para disfrutar de tu reserva.
                  </div>
                  {reserva.comentarios && (
                    <div className="text-xs text-neutral-400 truncate mt-1">{reserva.comentarios}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-neutral-500 mb-4">Aún no has realizado ninguna reserva.</p>
          <a href="/reservas" className="btn-primary px-6 py-2 rounded-lg font-semibold">Hacer Reserva</a>
        </div>
      )}
    </div>
  );
};

export default OwnReservas;
