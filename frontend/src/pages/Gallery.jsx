import { useState, useEffect } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { galleryAPI } from '../services/api'

const Gallery = () => {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await galleryAPI.getAll()
      setImages(response.data)
    } catch (error) {
      console.error('Error al cargar galería:', error)
      setError('No se pudieron cargar las imágenes. El backend no está disponible.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando galería...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchImages} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
            Galería
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Descubre nuestros platos más populares y deja que las imágenes hablen por sí solas
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="card cursor-pointer group"
            >
              <div className="h-64 bg-neutral-200 flex items-center justify-center overflow-hidden">
                {image.url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${image.url}`}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <ImageIcon className={`w-20 h-20 text-neutral-400 ${image.url ? 'hidden' : ''}`} />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900">{image.title}</h3>
                <p className="text-sm text-neutral-600">{image.category}</p>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No hay imágenes en la galería</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary-500 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="h-96 bg-neutral-200 flex items-center justify-center">
                {selectedImage.url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${selectedImage.url}`}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <ImageIcon className={`w-32 h-32 text-neutral-400 ${selectedImage.url ? 'hidden' : ''}`} />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-neutral-600">{selectedImage.category}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
