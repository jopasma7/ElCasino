import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/notificationsAPI';
import { toast } from 'react-toastify';

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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await notificationsAPI.getAll();
        setNotifications(res.data.notifications || []);
      } catch {
        toast.error('Error al cargar notificaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      toast.error('Error al marcar como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => notificationsAPI.markAsRead(n.id))
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      toast.error('Error al eliminar notificación');
    }
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
      <div className="divide-y divide-neutral-200" style={notifications.length > 3 ? { maxHeight: '400px', overflowY: 'auto' } : {}}>
        {loading ? (
          <div className="py-8 text-center text-neutral-400">Cargando notificaciones...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-neutral-400">No tienes notificaciones.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-2 py-2 transition-colors rounded-xl border border-neutral-200 shadow-sm bg-neutral-50 ${!n.read ? 'bg-primary-50/60 border-primary-200' : ''}`}
              style={{ marginBottom: '0.5rem', padding: '0.75rem' }}
            >
              {typeIcons[n.type]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-semibold text-sm ${!n.read ? 'text-primary-700' : 'text-neutral-800'}`}>{n.title}</span>
                  {!n.read && <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-primary-200 text-primary-800">Nuevo</span>}
                </div>
                <p className="text-neutral-700 text-sm mt-0.5 mb-1">
                  {(() => {
                    // Busca el nombre completo en el mensaje y lo pone en negrita
                    const regex = /El usuario (.+?) ha solicitado/;
                    const match = n.message.match(regex);
                    if (match) {
                      const name = match[1];
                      const before = n.message.split(name)[0];
                      const after = n.message.split(name)[1];
                      return <>{before}<strong className="font-bold text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded-lg">{name}</strong>{after}</>;
                    }
                    return n.message;
                  })()}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{new Date(n.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  {n.actionLabel && n.actionUrl && (
                    <a href={n.actionUrl} className="btn-secondary btn-xs ml-2">{n.actionLabel}</a>
                  )}
                  {!n.read && (
                    <button
                      className="ml-2 text-primary-700 underline text-xs"
                      onClick={() => markAsRead(n.id)}
                    >
                      Marcar como leída
                    </button>
                  )}
                  <button
                    className="ml-2 text-red-600 underline text-xs"
                    onClick={() => handleDelete(n.id)}
                  >
                    Eliminar notificación
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
