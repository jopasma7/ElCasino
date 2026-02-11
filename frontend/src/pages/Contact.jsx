import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const Contact = () => {
  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Contacto
          </h1>
          <p className="text-lg text-neutral-600">
            Visítanos, llámanos o escríbenos. ¡Estaremos encantados de atenderte!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Dirección</h3>
                    <p className="text-neutral-600">
                      Calle Principal, 1<br />
                      03820 Benilloba, Alicante<br />
                      España
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Teléfono</h3>
                    <a
                      href="tel:+34965511234"
                      className="text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      +34 965 51 12 34
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                    <a
                      href="mailto:info@elcasinobenilloba.com"
                      className="text-neutral-600 hover:text-primary-600 transition-colors"
                    >
                      info@elcasinobenilloba.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Horario</h3>
                    <div className="text-neutral-600 space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="font-medium">Lunes - Viernes:</span>
                        <span>8:00 - 16:00, 19:00 - 23:00</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium">Sábados:</span>
                        <span>8:00 - 23:30</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="font-medium">Domingos:</span>
                        <span>8:00 - 16:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-full min-h-[500px] bg-neutral-200 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 mb-4">
                  Mapa de ubicación
                </p>
                <p className="text-sm text-neutral-500">
                  {/* TODO: Integrar Google Maps */}
                  Integración con Google Maps próximamente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-primary-600 text-white rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">
            ¿Tienes alguna pregunta?
          </h2>
          <p className="text-xl text-primary-50 mb-6">
            No dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
          <a
            href="tel:+34965511234"
            className="inline-block bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Llamar Ahora
          </a>
        </div>
      </div>
    </div>
  )
}

export default Contact
