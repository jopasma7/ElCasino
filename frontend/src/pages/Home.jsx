import { Link } from 'react-router-dom'
import { ChefHat, UtensilsCrossed, Clock, Award, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'Cocina Tradicional',
      description: 'Platos caseros elaborados con recetas tradicionales y productos de calidad'
    },
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: 'Menú del Día',
      description: 'Menús variados cada día con primero, segundo, postre y bebida'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Horario Amplio',
      description: 'Abierto desde primera hora para desayunos, comidas y cenas'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Calidad Garantizada',
      description: 'Más de 30 años sirviendo a nuestros clientes con la mejor calidad'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Bienvenido a<br />El Casino Benilloba
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-50 leading-relaxed">
              Bar restaurante tradicional en el corazón de Benilloba. 
              Donde cada comida es una experiencia memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu-del-dia" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 inline-flex items-center justify-center gap-2">
                Ver Menú del Día
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pedido" className="btn-secondary bg-primary-500 hover:bg-primary-600 text-white inline-flex items-center justify-center">
                Hacer un Pedido
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Combinamos tradición, calidad y buen servicio para ofrecerte la mejor experiencia gastronómica
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            ¿Listo para disfrutar?
          </h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Visítanos o haz tu pedido online. Te esperamos con los brazos abiertos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contacto" className="btn-primary">
              Cómo Llegar
            </Link>
            <Link to="/menu" className="btn-secondary">
              Ver Carta Completa
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
