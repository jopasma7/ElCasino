import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// GET - Obtener todos los platos (público)
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query
    
    const where = {}
    if (category) where.category = category
    if (available !== undefined) where.available = available === 'true'
    
    const dishes = await prisma.dish.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    
    res.json(dishes)
  } catch (error) {
    console.error('Error al obtener platos:', error)
    res.status(500).json({ error: 'Error al obtener platos' })
  }
})

// GET - Obtener un plato por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: req.params.id }
    })
    
    if (!dish) {
      return res.status(404).json({ error: 'Plato no encontrado' })
    }
    
    res.json(dish)
  } catch (error) {
    console.error('Error al obtener plato:', error)
    res.status(500).json({ error: 'Error al obtener plato' })
  }
})

// POST - Crear nuevo plato (requiere autenticación)
router.post('/',
  authMiddleware,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('category').isIn(['entrantes', 'primeros', 'segundos', 'postres', 'bebidas'])
      .withMessage('Categoría inválida')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, description, price, category, available } = req.body
      const image = req.file ? `/uploads/${req.file.filename}` : null

      const dish = await prisma.dish.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          category,
          image,
          available: available !== undefined ? available === 'true' : true
        }
      })

      res.status(201).json(dish)
    } catch (error) {
      console.error('Error al crear plato:', error)
      res.status(500).json({ error: 'Error al crear plato' })
    }
  }
)

// PUT - Actualizar plato (requiere autenticación)
router.put('/:id',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description, price, category, available } = req.body
      const image = req.file ? `/uploads/${req.file.filename}` : undefined

      const updateData = {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(available !== undefined && { available: available === 'true' }),
        ...(image && { image })
      }

      const dish = await prisma.dish.update({
        where: { id: req.params.id },
        data: updateData
      })

      res.json(dish)
    } catch (error) {
      console.error('Error al actualizar plato:', error)
      res.status(500).json({ error: 'Error al actualizar plato' })
    }
  }
)

// DELETE - Eliminar plato (requiere autenticación)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.dish.delete({
      where: { id: req.params.id }
    })
    
    res.json({ message: 'Plato eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar plato:', error)
    res.status(500).json({ error: 'Error al eliminar plato' })
  }
})

export default router
