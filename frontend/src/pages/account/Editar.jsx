import React from 'react';

const Editar = ({ profileData, onProfileChange, onProfileSubmit, submitting, currentAvatar, setProfileAvatarPreview, handleLogout }) => {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-2xl font-semibold">Actualizar Perfil</h3>
          <p className="text-sm text-neutral-500">Mantén tus datos al día para pedidos mas rapidos.</p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-neutral-400">
          <span>Cuenta</span>
          <span className="w-12 h-px bg-neutral-200" />
          <span>Preferencias</span>
        </div>
      </div>
      <form onSubmit={onProfileSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nombre</label>
            <input
              className="input-field"
              value={profileData.name}
              onChange={e => onProfileChange({ ...profileData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Teléfono</label>
            <input
              className="input-field"
              value={profileData.phone}
              onChange={e => onProfileChange({ ...profileData, phone: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">Avatar</label>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label
              htmlFor="profile-avatar"
              className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shadow cursor-pointer group"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <img
                  src="/avatar-default.svg"
                  alt="Avatar por defecto"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
              )}
              <span className="absolute inset-0 bg-black/40 text-white text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                Cambiar
              </span>
            </label>
            <div>
              <input
                id="profile-avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => onProfileChange({ ...profileData, avatar: e.target.files?.[0] || null })}
              />
              <p className="text-sm text-neutral-500">Haz click en el avatar para subir una nueva imagen.</p>
            </div>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
};

export default Editar;
