import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET - Obtener el menú del día actual (público)
router.get('/today', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menu = await prisma.dailyMenu.findFirst({
      where: {
        date: {
          gte: today
        },
        active: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    if (!menu) {
      return res.status(404).json({ error: 'No hay menú del día disponible' })
    }

    res.json(menu)
  } catch (error) {
    console.error('Error al obtener menú del día:', error)
    res.status(500).json({ error: 'Error al obtener menú del día' })
  }
})

// GET - Obtener todos los menús (requiere autenticación)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const menus = await prisma.dailyMenu.findMany({
      orderBy: { date: 'desc' }
    })
    
    res.json(menus)
  } catch (error) {
    console.error('Error al obtener menús:', error)
    res.status(500).json({ error: 'Error al obtener menús' })
  }
})

// GET - Obtener menú por ID (requiere autenticación)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const menu = await prisma.dailyMenu.findUnique({
      where: { id: req.params.id }
    })
    
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' })
    }
    
    res.json(menu)
  } catch (error) {
    console.error('Error al obtener menú:', error)
    res.status(500).json({ error: 'Error al obtener menú' })
  }
})

// POST - Crear nuevo menú del día (requiere autenticación)
router.post('/',
  authMiddleware,
  [
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('singleDishPrice').optional().isFloat({ min: 0 }).withMessage('El precio del plato único debe ser mayor a 0'),
    body('completeSingleDishPrice').optional().isFloat({ min: 0 }).withMessage('El precio del menú completo 1 plato debe ser mayor a 0'),
    body('includes').isArray().withMessage('Includes debe ser un array'),
    body('starters').isArray().withMessage('Starters debe ser un array'),
    body('mains').isArray().withMessage('Mains debe ser un array'),
    body('desserts').isArray().withMessage('Desserts debe ser un array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { date, price, singleDishPrice, completeSingleDishPrice, includes, starters, mains, desserts, active } = req.body

      // Si no se proporciona fecha, usar la fecha actual
      const menuDate = date ? new Date(date) : new Date()
      menuDate.setHours(0, 0, 0, 0)

      // Usar upsert para actualizar si existe o crear si no existe
      const menu = await prisma.dailyMenu.upsert({
        where: {
          date: menuDate
        },
        update: {
          price: parseFloat(price),
          singleDishPrice: singleDishPrice ? parseFloat(singleDishPrice) : null,
          completeSingleDishPrice: completeSingleDishPrice ? parseFloat(completeSingleDishPrice) : null,
          includes,
          starters,
          mains,
          desserts,
          active: active !== undefined ? active : true
        },
        create: {
          date: menuDate,
          price: parseFloat(price),
          singleDishPrice: singleDishPrice ? parseFloat(singleDishPrice) : null,
          completeSingleDishPrice: completeSingleDishPrice ? parseFloat(completeSingleDishPrice) : null,
          includes,
          starters,
          mains,
          desserts,
          active: active !== undefined ? active : true
        }
      })

      res.status(201).json(menu)
    } catch (error) {
      console.error('Error al crear menú:', error)
      res.status(500).json({ error: 'Error al crear menú' })
    }
  }
)

// PUT - Actualizar menú del día (requiere autenticación)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { price, singleDishPrice, completeSingleDishPrice, includes, starters, mains, desserts, active } = req.body

    const updateData = {
      ...(price && { price: parseFloat(price) }),
      ...(singleDishPrice !== undefined && { singleDishPrice: singleDishPrice ? parseFloat(singleDishPrice) : null }),
      ...(completeSingleDishPrice !== undefined && { completeSingleDishPrice: completeSingleDishPrice ? parseFloat(completeSingleDishPrice) : null }),
      ...(includes && { includes }),
      ...(starters && { starters }),
      ...(mains && { mains }),
      ...(desserts && { desserts }),
      ...(active !== undefined && { active })
    }

    const menu = await prisma.dailyMenu.update({
      where: { id: req.params.id },
      data: updateData
    })

    res.json(menu)
  } catch (error) {
    console.error('Error al actualizar menú:', error)
    res.status(500).json({ error: 'Error al actualizar menú' })
  }
})

// DELETE - Eliminar menú (requiere autenticación)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.dailyMenu.delete({
      where: { id: req.params.id }
    })
    
    res.json({ message: 'Menú eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar menú:', error)
    res.status(500).json({ error: 'Error al eliminar menú' })
  }
})

export default router
