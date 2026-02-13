import { MapPin, Phone, Mail, Clock, Facebook, Instagram, ChefHat, Heart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const Footer = () => {
  const location = useLocation();
  const isTPV = location.pathname === '/tpv';

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-8 h-8 text-primary-500" />
              <h3 className="text-2xl font-display font-bold text-white">El Casino</h3>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Bar restaurante tradicional en el corazón de Benilloba. Cocina casera y trato cercano para ti y los tuyos.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Menu rápido */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Menú Rápido</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary-500 transition-colors">
                  Nuestra Carta
                </Link>
              </li>
              <li>
                <Link to="/menu-del-dia" className="hover:text-primary-500 transition-colors">
                  Menú del Día
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="hover:text-primary-500 transition-colors">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/pedido" className="hover:text-primary-500 transition-colors">
                  Hacer un Pedido
                </Link>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Horario
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-white">Lunes</p>
                <p className="text-neutral-400">Cerrado</p>
              </div>
              <div>
                <p className="font-medium text-white">Martes - Domingo</p>
                <p className="text-neutral-400">8:00 - 16:00</p>
              </div>
              <div>
                <p className="font-medium text-white">En fiestas y eventos</p>
                <p className="text-neutral-400">Abierto por la noche</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contacto</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-neutral-400">
                  Plaça la Font, 2<br />
                  03810 Benilloba<br />
                  Alicante, España
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="tel:+34722741992" className="text-neutral-400 hover:text-primary-500 transition-colors">
                  +34 722 74 19 92
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@elcasinobenilloba.com" className="text-neutral-400 hover:text-primary-500 transition-colors text-xs">
                  info@elcasino.com
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          {!isTPV && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">¡Haz tu Pedido!</h4>
              <p className="text-sm text-neutral-400 mb-6">
                Haz tu pedido online y disfruta de nuestros platos cuando y donde quieras.
              </p>
              <Link
                to="/pedido"
                className="block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all transform hover:scale-105 mb-6"
              >
                Pedir Ahora
              </Link>
              <Link
                to="/admin"
                className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
              >
                Acceso de Administración
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800"></div>

        {/* Bottom */}
        <div className="py-8 text-center text-sm text-neutral-400">
          <p className="flex items-center justify-center gap-2 mb-3">
            Hecho con <Heart className="w-4 h-4 text-primary-500 fill-primary-500" /> en Benilloba
          </p>
          <p>&copy; {new Date().getFullYear()} El Casino Benilloba. Todos los derechos reservados.</p>
          <p className="mt-3 text-xs">
            <Link to="/" className="hover:text-primary-500">Inicio</Link> • 
            <Link to="/menu" className="hover:text-primary-500 mx-2">Términos</Link> • 
            <Link to="/contacto" className="hover:text-primary-500">Privacidad</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
