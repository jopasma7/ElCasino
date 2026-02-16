import React from 'react';

const Ajustes = ({ passwordData, onPasswordChange, passwordChanging, submitting }) => {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-2 text-primary-700">Cambiar Contraseña</h3>
        <form className="space-y-3 max-w-md" onSubmit={async (e) => {
          e.preventDefault();
          if (!passwordData.current || !passwordData.new || !passwordData.repeat) {
            alert('Completa todos los campos');
            return;
          }
          if (passwordData.new.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres');
            return;
          }
          if (passwordData.new !== passwordData.repeat) {
            alert('Las contraseñas no coinciden');
            return;
          }
          // Aquí deberías llamar a la función de cambio de contraseña real
        }}>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              className="input-field w-full"
              placeholder="Introduce tu contraseña actual"
              value={passwordData.current}
              onChange={e => onPasswordChange({ ...passwordData, current: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nueva contraseña</label>
            <input
              type="password"
              className="input-field w-full"
              placeholder="Nueva contraseña"
              value={passwordData.new}
              onChange={e => onPasswordChange({ ...passwordData, new: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Repetir nueva contraseña</label>
            <input
              type="password"
              className="input-field w-full"
              placeholder="Repite la nueva contraseña"
              value={passwordData.repeat}
              onChange={e => onPasswordChange({ ...passwordData, repeat: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={passwordChanging}>
            {passwordChanging ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-primary-700">Privacidad y permisos</h3>
        <p className="text-neutral-600 text-sm mb-1">Tus datos personales solo se usan para gestionar reservas y mejorar tu experiencia. Puedes solicitar la eliminación de tu cuenta en cualquier momento.</p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-primary-700">Desconectar todos los dispositivos</h3>
        <p className="text-neutral-600 text-sm mb-2">¿Has iniciado sesión en un dispositivo público o compartido? Puedes cerrar todas tus sesiones activas aquí.</p>
        <button type="button" className="btn-primary opacity-60 cursor-not-allowed" disabled>
          Desconectar todos los dispositivos (próximamente)
        </button>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-primary-700">Actividad reciente</h3>
        <ul className="text-neutral-600 text-sm list-disc pl-5">
          <li>Inicio de sesión: 16/02/2026 12:34</li>
          <li>Reserva creada: 15/02/2026 19:00</li>
          <li>Perfil actualizado: 10/02/2026 09:12</li>
          <li>Contraseña cambiada: 01/02/2026 17:45</li>
        </ul>
      </div>
    </div>
  );
};

export default Ajustes;
