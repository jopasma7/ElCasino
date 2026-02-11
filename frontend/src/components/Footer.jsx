import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre Nosotros */}
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-4">El Casino</h3>
            <p className="text-sm leading-relaxed">
              Bar restaurante en el corazón de Benilloba. Tradición, sabor y calidad en cada plato.
            </p>
          </div>

          {/* Horario */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horario
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-white">Lunes - Viernes</p>
                <p>8:00 - 16:00</p>
                <p>19:00 - 23:00</p>
              </div>
              <div>
                <p className="font-medium text-white">Sábados</p>
                <p>8:00 - 23:30</p>
              </div>
              <div>
                <p className="font-medium text-white">Domingos</p>
                <p>8:00 - 16:00</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p>Calle Principal, 1<br />03820 Benilloba, Alicante</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary-500" />
                <a href="tel:+34965511234" className="hover:text-primary-500 transition-colors">
                  +34 965 51 12 34
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-500" />
                <a href="mailto:info@elcasinobenilloba.com" className="hover:text-primary-500 transition-colors">
                  info@elcasinobenilloba.com
                </a>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6">
              <Link
                to="/admin"
                className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
              >
                Administración
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} El Casino Benilloba. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
