import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { userAuthAPI, userProfileAPI, reservasAPI } from '../services/api'
import NotificationsTab from './account/Notifications'
import Editar from './account/Editar';
import OwnReservas from './account/OwnReservas';
import Ajustes from './account/Ajustes';

const Account = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [reservas, setReservas] = useState([])
  const [activeTab, setActiveTab] = useState('perfil');
  const tabs = [
    { key: 'perfil', label: 'Editar Perfil' },
    { key: 'reservas', label: 'Mis Reservas' },
    { key: 'ajustes', label: 'Ajustes' },
    { key: 'notificaciones', label: 'Notificaciones' },
  ];

  // DEBUG: Mostrar el objeto profile en consola para verificar el campo role
  // useEffect(() => {
  //   if (profile) {
  //     console.log('Perfil cargado:', profile)
  //   }
  // }, [profile])
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    avatar: null
  })
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    repeat: ''
  })
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [registerAvatarPreview, setRegisterAvatarPreview] = useState(null)
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(null)


  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchProfile()
      fetchReservas()
    } else {
      setLoading(false)
    }
  }, [])

  // Obtener reservas del usuario
  const fetchReservas = async () => {
    try {
      const res = await reservasAPI.getMis();
      setReservas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setReservas([])
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await userProfileAPI.getMe()
      setProfile(response.data)
      setProfileData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        avatar: null
      })
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await userAuthAPI.login(loginData)
      localStorage.setItem('token', response.data.token)
      setProfile(response.data.user)
      setProfileData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        email: response.data.user.email || '',
        avatar: null
      })
      setIsAuthenticated(true)
      toast.success('Inicio de sesión exitoso')
      window.dispatchEvent(new Event('user-auth-changed'))
      // ACTUALIZAR RESERVAS AL INICIAR SESIÓN
      fetchReservas()
    } catch (error) {
      toast.error('Email o contraseña incorrectos')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('name', registerData.name)
      payload.append('phone', registerData.phone)
      payload.append('password', registerData.password)
      payload.append('email', registerData.email)
      if (registerData.avatar) {
        payload.append('avatar', registerData.avatar)
      }

      const response = await userAuthAPI.register(payload)
      localStorage.setItem('token', response.data.token)
      setProfile(response.data.user)
      setProfileData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        email: response.data.user.email || '',
        avatar: null
      })
      setIsAuthenticated(true)
      toast.success('Registro exitoso')
      window.dispatchEvent(new Event('user-auth-changed'))
    } catch (error) {
      // Intenta mostrar el mensaje del backend si existe
      const msg = error?.response?.data?.errors?.[0]?.msg || error?.response?.data?.error || 'Error al registrar usuario'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    // Validar que el teléfono solo contenga números
    if (!/^[0-9]{7,15}$/.test(profileData.phone)) {
      toast.error('Introduce un teléfono válido (solo números, sin espacios)')
      return
    }
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('name', profileData.name)
      payload.append('phone', profileData.phone)
      payload.append('email', profileData.email)
      if (profileData.avatar) {
        payload.append('avatar', profileData.avatar)
      }

      const response = await userProfileAPI.updateMe(payload)
      setProfile(response.data)
      setProfileData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        avatar: null
      })
      toast.success('Perfil actualizado')
      window.dispatchEvent(new Event('user-auth-changed'))
    } catch (error) {
      toast.error('Error al actualizar perfil')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setProfile(null)
    toast.info('Sesión cerrada correctamente')
    window.dispatchEvent(new Event('user-auth-changed'))
  }

  const MySwal = withReactContent(Swal)
  const handleDeleteAccount = async () => {
    const result = await MySwal.fire({
      title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar cuenta?</span>',
      html: '<div style="color:#444">¿Seguro que quieres eliminar tu cuenta? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    })
    if (!result.isConfirmed) return;
    try {
      await userProfileAPI.deleteMe();
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setProfile(null);
      toast.success('Cuenta eliminada correctamente');
      window.dispatchEvent(new Event('user-auth-changed'));
    } catch (error) {
      const msg = error?.response?.data?.error || 'Error al eliminar la cuenta';
      toast.error(msg);
    }
  }

  const avatarUrl = profile?.avatar
    ? (profile.avatar.startsWith('http')
      ? profile.avatar
      : `https://elcasino-backend.zeabur.app${profile.avatar}`)
    : null

  const currentAvatar = profileAvatarPreview || avatarUrl

  useEffect(() => {
    if (!registerData.avatar) {
      setRegisterAvatarPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(registerData.avatar)
    setRegisterAvatarPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [registerData.avatar])

  useEffect(() => {
    if (!profileData.avatar) {
      setProfileAvatarPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(profileData.avatar)
    setProfileAvatarPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [profileData.avatar])

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_55%),linear-gradient(120deg,#1f2937,transparent_60%),linear-gradient(60deg,#0f172a,#1f2937)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative z-10 container mx-auto px-4 py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-primary-200">
              El Casino Members
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold">
              Tu espacio privado para reservar con estilo
            </h1>
            <p className="mt-4 text-lg text-neutral-200">
              Gestiona tu perfil, guarda tus preferencias y acelera tus pedidos.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="bg-white/95 text-neutral-900 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-lg p-6 md:p-10">

        {isAuthenticated ? (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            <div className="rounded-2xl bg-neutral-900 text-white p-6 shadow-xl">
              <div className="flex flex-col items-center text-center">
                {profile?.role === 'Administrador' && (
                  <div className="flex justify-center mb-4">
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-yellow-900 text-xs font-bold uppercase shadow-sm border border-yellow-300 animate-pulse">
                      Administrador
                    </span>
                  </div>
                )}
                <div className="w-28 h-28 rounded-full bg-neutral-800 overflow-hidden mb-4 ring-4 ring-white/10">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">Sin avatar</div>
                  )}
                </div>
                <h2 className="text-2xl font-semibold">{profile?.name}</h2>
                <p className="text-sm text-neutral-300">{profile?.phone}</p>
                {profile?.email && <p className="text-sm text-neutral-300">{profile.email}</p>}
                <div className="mt-6 w-full rounded-xl bg-white/10 p-4 text-left text-sm">
                  <p className="text-neutral-200">Estado: Miembro activo</p>
                  <p className="text-neutral-400">Beneficios: Reservas rapidas</p>
                </div>
                 <button
                   onClick={handleLogout}
                   className="mt-6 w-full px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
                 >
                   Cerrar sesión
                 </button>
                 <button
                   onClick={handleDeleteAccount}
                   className="mt-3 w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                 >
                   Eliminar cuenta
                 </button>
              </div>
            </div>

            <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-700'}`}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              {activeTab === 'perfil' && (
                <Editar
                  profileData={profileData}
                  onProfileChange={setProfileData}
                  onProfileSubmit={handleProfileUpdate}
                  submitting={submitting}
                  currentAvatar={currentAvatar}
                  setProfileAvatarPreview={setProfileAvatarPreview}
                />
              )}
              {activeTab === 'reservas' && (
                <OwnReservas reservas={reservas} />
              )}
              {activeTab === 'ajustes' && (
                <Ajustes
                  profileData={profileData}
                  passwordData={passwordData}
                  onProfileChange={setProfileData}
                  onPasswordChange={setPasswordData}
                  onProfileSubmit={handleProfileUpdate}
                  onPasswordSubmit={null}
                  passwordChanging={passwordChanging}
                  submitting={submitting}
                />
              )}
              {activeTab === 'notificaciones' && (
                <NotificationsTab />
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl">
                <h3 className="text-2xl font-semibold mb-2">Iniciar Sesión</h3>
                <p className="text-sm text-neutral-500 mb-6">Accede con tu email y contraseña.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Contraseña</label>
                    <input
                      type="password"
                      className="input-field"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-primary-700 cursor-not-allowed opacity-70">
                      ¿Has olvidado tu contraseña? <span className="text-neutral-400">(próximamente)</span>
                    </span>
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              </div>
              <div className="rounded-2xl bg-white p-6 md:p-8 shadow-xl">
                <h3 className="text-2xl font-semibold mb-2">Crear Cuenta</h3>
                <p className="text-sm text-neutral-500 mb-6">Un perfil te permite repetir pedidos y guardar tus datos.</p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nombre</label>
                    <input
                      className="input-field"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Telefono</label>
                      <input
                        className="input-field"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Contraseña</label>
                      <input
                        type="password"
                        className="input-field"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">Avatar</label>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <label
                        htmlFor="register-avatar"
                        className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shadow cursor-pointer group"
                      >
                        {registerAvatarPreview ? (
                          <img src={registerAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src="/avatar-default.svg"
                            alt="Avatar por defecto"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                          />
                        )}
                        <span className="absolute inset-0 bg-black/40 text-white text-xs font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          Subir
                        </span>
                      </label>
                      <div>
                        <input
                          id="register-avatar"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setRegisterData({ ...registerData, avatar: e.target.files?.[0] || null })}
                        />
                        <p className="text-sm text-neutral-500">Click en el avatar para elegir una imagen.</p>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Creando...' : 'Crear cuenta'}
                  </button>
                </form>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Account
