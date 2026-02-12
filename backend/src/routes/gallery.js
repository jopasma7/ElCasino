import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// GET - Obtener todas las imágenes de la galería (público)
router.get('/', async (req, res) => {
  try {
    const { visible } = req.query
    const where = {}
    if (visible !== undefined) {
      where.visible = visible === 'true'
    }

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(images)
  } catch (error) {
    console.error('Error al obtener galería:', error)
    res.status(500).json({ error: 'Error al obtener galería' })
  }
})

// GET - Obtener una imagen por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: req.params.id }
    })
    
    if (!image) {
      return res.status(404).json({ error: 'Imagen no encontrada' })
    }
    
    res.json(image)
  } catch (error) {
    console.error('Error al obtener imagen:', error)
    res.status(500).json({ error: 'Error al obtener imagen' })
  }
})

// POST - Subir nueva imagen (requiere autenticación)
// Acepta tanto file upload (multipart/form-data) como URL directo (application/json)
router.post('/',
  authMiddleware,
  async (req, res) => {
    try {
      // Si es multipart/form-data, usar upload middleware
      const uploadMiddleware = upload.single('image')
      
      uploadMiddleware(req, res, async (err) => {
        if (err && req.get('content-type')?.includes('multipart')) {
          return res.status(400).json({ error: err.message })
        }

        // Validación
        const { title, category, url, visible } = req.body
        
        if (!title) {
          return res.status(400).json({ error: 'El título es requerido' })
        }
        
        if (!category) {
          return res.status(400).json({ error: 'La categoría es requerida' })
        }

        // Aceptar URL directo (JSON) o archivo uploaded (multipart)
        if (!req.file && !url) {
          return res.status(400).json({ error: 'La imagen o URL es requerida' })
        }

        const finalUrl = url || `/uploads/${req.file.filename}`

        const image = await prisma.galleryImage.create({
          data: {
            title,
            category,
            url: finalUrl,
            visible: visible !== undefined ? visible === 'true' : true
          }
        })

        res.status(201).json(image)
      })
    } catch (error) {
      console.error('Error al crear imagen:', error)
      res.status(500).json({ error: 'Error al crear imagen' })
    }
  }
)

// PUT - Actualizar imagen (requiere autenticación)
router.put('/:id',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, category, visible } = req.body
      const url = req.file ? `/uploads/${req.file.filename}` : undefined

      const updateData = {
        ...(title && { title }),
        ...(category && { category }),
        ...(url && { url }),
        ...(visible !== undefined && { visible: visible === 'true' })
      }

      const image = await prisma.galleryImage.update({
        where: { id: req.params.id },
        data: updateData
      })

      res.json(image)
    } catch (error) {
      console.error('Error al actualizar imagen:', error)
      res.status(500).json({ error: 'Error al actualizar imagen' })
    }
  }
)

// DELETE - Eliminar imagen (requiere autenticación)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.galleryImage.delete({
      where: { id: req.params.id }
    })
    
    res.json({ message: 'Imagen eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    res.status(500).json({ error: 'Error al eliminar imagen' })
  }
})

export default router
