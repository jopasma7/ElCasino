import { Link } from 'react-router-dom'
import { ChefHat, UtensilsCrossed, Clock, Award, ArrowRight, MapPin, Phone, Mail, Star, Users } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'Cocina Tradicional',
      description: 'Platos caseros elaborados con recetas tradicionales y productos de calidad superior'
    },
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: 'Menú del Día',
      description: 'Menús variados cada día con primero, segundo, postre y bebida incluida'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Atención Rápida',
      description: 'Servicio ágil sin sacrificar la calidad en nuestras preparaciones'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Experiencia',
      description: 'Compromiso y dedicación en cada servicio'
    }
  ]

  const testimonials = [
    {
      name: 'María García',
      text: 'Excelente comida, muy bien hecha y con mucho sabor. El menú del día es inmejorable.',
      rating: 5
    },
    {
      name: 'Juan López',
      text: 'Lugar acogedor y atención detallista. Siempre me siento como en casa.',
      rating: 5
    },
    {
      name: 'Elena Martínez',
      text: 'Los platos están deliciosos y las raciones son generosas. Perfectamente recomendable.',
      rating: 5
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section Mejorado */}
      <section className="relative min-h-[70vh] md:h-[600px] flex items-center overflow-hidden pt-14 sm:pt-0">
        {/* Background Image con overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}></div>
        </div>

        {/* Contenido */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-4 sm:mb-6 inline-block">
              <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                🍽️ Sabor local, calidad y cercanía
              </span>
            </div>
            
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight">
              El Casino<br />Benilloba
            </h1>
            
            <p className="text-base xs:text-lg md:text-2xl text-primary-50 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
              Bar restaurante tradicional en el corazón de Benilloba. 
              Donde cada comida es una experiencia única con sabor a casa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link to="/menu-del-dia" className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 sm:px-8 sm:py-4 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all transform hover:scale-105 text-sm sm:text-lg">
                Ver Menú del Día
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pedido" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-lg font-semibold inline-flex items-center justify-center transition-all transform hover:scale-105 text-sm sm:text-lg">
                Hacer un Pedido
              </Link>
            </div>

            {/* Quick Info */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-6 sm:gap-8 text-white">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary-300" />
                <div>
                  <p className="text-sm text-primary-200">Horario</p>
                  <p className="font-semibold">8:00 - 16:00 (Lunes cerrado)</p>
                  <p className="text-xs text-primary-200">En fiestas y eventos: abierto por la noche</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary-300" />
                <div>
                  <p className="text-sm text-primary-200">Ubicación</p>
                  <p className="font-semibold">Plaça la Font, 2, 03810 Benilloba, Alicante</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-primary-300" />
                <div>
                  <p className="text-sm text-primary-200">Teléfono</p>
                  <p className="font-semibold">+34 722 74 19 92</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section className="py-12 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <div className="w-16 h-1 bg-primary-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-5 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-neutral-900">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección "Sobre Nosotros" */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Imagen placeholder */}
            <div className="relative">
              <div className="rounded-xl w-full h-56 xs:h-72 sm:h-96 md:h-full shadow-lg border border-primary-100 bg-neutral-200 flex items-center justify-center overflow-hidden">
                <img 
                  src="/restaurante.png"
                  alt="Restaurante El Casino Benilloba"
                  className="object-contain w-full h-full"
                  style={{ objectPosition: 'center' }}
                />
              </div>
            </div>

            {/* Contenido */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4 sm:mb-6">
                Tradición y calidad en cada plato
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 mb-3 sm:mb-4 leading-relaxed">
                El Casino Benilloba es mucho más que un restaurante. Es un lugar donde generaciones de familias han compartido comidas memorables, donde la tradición culinaria se mezcla con la calidez del trato personalizado.
              </p>
              {/* Párrafo eliminado por solicitud */}
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-base sm:text-lg">Productos locales</h3>
                    <p className="text-neutral-600 text-sm sm:text-base">Trabajamos con proveedores de confianza de la región</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-base sm:text-lg">Recetas tradicionales</h3>
                    <p className="text-neutral-600 text-sm sm:text-base">Elaboradas con técnicas transmitidas por generaciones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-base sm:text-lg">Atención personalizada</h3>
                    <p className="text-neutral-600 text-sm sm:text-base">Te tratamos como parte de nuestra familia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <div className="w-16 h-1 bg-primary-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-5 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-24 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4 sm:mb-6">
            ¿Listo para una experiencia culinaria memorable?
          </h2>
          <p className="text-base sm:text-xl text-primary-50 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Visítanos hoy o haz tu pedido online. Te esperamos con lo mejor de nuestra cocina.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/contacto" className="bg-white text-primary-700 hover:bg-primary-50 px-5 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all text-base sm:text-lg">
              <MapPin className="w-5 h-5" />
              Cómo Llegar
            </Link>
            <Link to="/menu" className="border-2 border-white text-white hover:bg-white hover:text-primary-700 px-5 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold inline-flex items-center justify-center transition-all text-base sm:text-lg">
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              Ver Carta Completa
            </Link>
          </div>
        </div>
      </section>
    </div>

  )
}

export default Home
