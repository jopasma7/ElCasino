import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET - Obtener opciones del menú diario (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const options = await prisma.dailyMenuOption.findMany({
      where: { active: true },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    })

    res.json(options)
  } catch (error) {
    console.error('Error al obtener opciones de menú diario:', error)
    res.status(500).json({ error: 'Error al obtener opciones de menú diario' })
  }
})

// POST - Crear opción del menú diario (admin)
router.post('/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('type').isIn(['starter', 'main', 'dessert']).withMessage('Tipo inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, type } = req.body

      const option = await prisma.dailyMenuOption.create({
        data: {
          name,
          type
        }
      })

      res.status(201).json(option)
    } catch (error) {
      console.error('Error al crear opción de menú diario:', error)
      res.status(500).json({ error: 'Error al crear opción de menú diario' })
    }
  }
)

// DELETE - Eliminar opción (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.dailyMenuOption.update({
      where: { id: req.params.id },
      data: { active: false }
    })

    res.json({ message: 'Opción eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar opción de menú diario:', error)
    res.status(500).json({ error: 'Error al eliminar opción de menú diario' })
  }
})

export default router
