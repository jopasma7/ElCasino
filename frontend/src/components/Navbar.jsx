import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChefHat } from 'lucide-react'
import { userProfileAPI } from '../services/api'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const [userAvatar, setUserAvatar] = useState(null)
  const [userName, setUserName] = useState(null)

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/menu', label: 'Carta' },
    { path: '/menu-del-dia', label: 'Menú del Día' },
    { path: '/galeria', label: 'Galería' },
    { path: '/contacto', label: 'Contacto' },
    { path: '/cuenta', label: 'Cuenta' }
  ]

  const isActive = (path) => location.pathname === path

  const loadProfile = async () => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      setUserAvatar(null)
      setUserName(null)
      return
    }

    try {
      const response = await userProfileAPI.getMe()
      setUserName(response.data?.name || null)
      const avatar = response.data?.avatar
      if (avatar) {
        const resolved = avatar.startsWith('http')
          ? avatar
          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${avatar}`
        setUserAvatar(resolved)
      } else {
        setUserAvatar('/avatar-default.svg')
      }
    } catch (error) {
      setUserAvatar(null)
      setUserName(null)
    }
  }

  useEffect(() => {
    loadProfile()

    const handleAuthChange = () => loadProfile()
    window.addEventListener('user-auth-changed', handleAuthChange)

    return () => {
      window.removeEventListener('user-auth-changed', handleAuthChange)
    }
  }, [])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">El Casino</h1>
              <p className="text-xs text-neutral-600">Benilloba</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <div className="flex items-center gap-8 justify-center">
              {navLinks.filter(link => link.path !== '/cuenta').map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors relative group ${
                    isActive(link.path)
                      ? 'text-primary-600'
                      : 'text-neutral-700 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 transition-all ${
                      isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/pedido" className="btn-primary">
              Hacer Pedido
            </Link>
            <Link
              to="/cuenta"
              className="flex items-center gap-3 font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              <span className="inline-flex w-10 h-10 rounded-full overflow-hidden shadow-sm bg-neutral-100">
                <img
                  src={userAvatar || '/avatar-default.svg'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </span>
              <span>{userName || 'Cuenta'}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.filter(link => link.path !== '/cuenta').map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 px-4 rounded-lg mb-1 transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cuenta"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-lg mb-1 text-neutral-700 hover:bg-neutral-50"
            >
              <span className="inline-flex w-9 h-9 rounded-full overflow-hidden bg-neutral-100">
                <img src={userAvatar || '/avatar-default.svg'} alt="Avatar" className="w-full h-full object-cover" />
              </span>
              <span>{userName || 'Cuenta'}</span>
            </Link>
            <Link
              to="/pedido"
              onClick={() => setIsOpen(false)}
              className="block mt-4 text-center btn-primary"
            >
              Hacer Pedido
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
