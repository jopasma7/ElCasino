import React, { useState } from 'react';

const mockNotifications = [
  {
    id: 1,
    type: 'reserva',
    title: 'Reserva confirmada',
    message: 'Tu reserva para 4 personas el 18/02/2026 a las 21:00 ha sido confirmada.',
    date: '2026-02-16T12:00:00',
    read: false,
    action: { label: 'Ver reserva', url: '/reservas' }
  },
  {
    id: 2,
    type: 'promocion',
    title: '¡Nuevo menú degustación!',
    message: 'Descubre nuestro nuevo menú especial solo este mes. ¡Reserva ya tu mesa!',
    date: '2026-02-15T10:00:00',
    read: false,
    action: { label: 'Ver menú', url: '/menu' }
  },
  {
    id: 3,
    type: 'cuenta',
    title: 'Contraseña cambiada',
    message: 'Tu contraseña se ha actualizado correctamente.',
    date: '2026-02-10T09:12:00',
    read: true
  },
  {
    id: 4,
    type: 'reserva',
    title: 'Reserva rechazada',
    message: 'Lamentamos informarte que tu reserva para el 12/02/2026 no pudo ser confirmada.',
    date: '2026-02-09T18:00:00',
    read: true
  }
];

const typeIcons = {
  reserva: (
    <span className="inline-block w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-3">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    </span>
  ),
  promocion: (
    <span className="inline-block w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center mr-3">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
    </span>
  ),
  cuenta: (
    <span className="inline-block w-8 h-8 bg-neutral-200 text-neutral-700 rounded-full flex items-center justify-center mr-3">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    </span>
  )
};

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Notificaciones</h2>
          <p className="text-neutral-600">Aquí verás tus avisos importantes, promociones y mensajes del sistema.</p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={markAllAsRead}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>
      <div className="divide-y divide-neutral-200">
        {notifications.length === 0 && (
          <div className="py-8 text-center text-neutral-400">No tienes notificaciones.</div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-2 py-5 transition-colors ${!n.read ? 'bg-primary-50/60' : ''}`}
          >
            {typeIcons[n.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-base ${!n.read ? 'text-primary-700' : 'text-neutral-800'}`}>{n.title}</span>
                {!n.read && <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-primary-200 text-primary-800">Nuevo</span>}
              </div>
              <p className="text-neutral-700 text-sm mt-1 mb-1">{n.message}</p>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{new Date(n.date).toLocaleString('es-ES')}</span>
                {n.action && (
                  <a href={n.action.url} className="btn-secondary btn-xs ml-2">{n.action.label}</a>
                )}
                {!n.read && (
                  <button
                    className="ml-2 text-primary-700 underline text-xs"
                    onClick={() => markAsRead(n.id)}
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsTab;
