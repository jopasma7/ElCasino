import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET - Obtener todos los pedidos (requiere autenticación)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, date } = req.query
    
    const where = {}
    if (status) where.status = status
    if (date) {
      const searchDate = new Date(date)
      searchDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(searchDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.createdAt = {
        gte: searchDate,
        lt: nextDay
      }
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            dish: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(orders)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
})

// GET - Obtener un pedido por ID (requiere autenticación)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            dish: true
          }
        }
      }
    })
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }
    
    res.json(order)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    res.status(500).json({ error: 'Error al obtener pedido' })
  }
})

// POST - Crear nuevo pedido (público)
router.post('/',
  [
    body('type').isIn(['takeaway', 'delivery']).withMessage('Tipo de pedido inválido'),
    body('customerName').notEmpty().withMessage('El nombre es requerido'),
    body('customerPhone').notEmpty().withMessage('El teléfono es requerido'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
    body('items.*.dishId').notEmpty().withMessage('Dish ID es requerido'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        type,
        customerName,
        customerPhone,
        customerAddress,
        notes,
        items
      } = req.body

      // Validar que si es delivery, tenga dirección
      if (type === 'delivery' && !customerAddress) {
        return res.status(400).json({ 
          error: 'La dirección es requerida para pedidos a domicilio' 
        })
      }

      // Obtener información de los platos y calcular totales
      let subtotal = 0
      const orderItems = []

      for (const item of items) {
        const dish = await prisma.dish.findUnique({
          where: { id: item.dishId }
        })

        if (!dish) {
          return res.status(404).json({ 
            error: `Plato con ID ${item.dishId} no encontrado` 
          })
        }

        if (!dish.available) {
          return res.status(400).json({ 
            error: `El plato ${dish.name} no está disponible` 
          })
        }

        const itemTotal = dish.price * item.quantity
        subtotal += itemTotal

        orderItems.push({
          dishId: dish.id,
          quantity: item.quantity,
          price: dish.price
        })
      }

      const total = subtotal // Aquí podrías agregar costos de envío, descuentos, etc.

      // Crear el pedido
      const order = await prisma.order.create({
        data: {
          type,
          customerName,
          customerPhone,
          customerAddress: type === 'delivery' ? customerAddress : null,
          notes,
          subtotal,
          total,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              dish: true
            }
          }
        }
      })

      res.status(201).json(order)
    } catch (error) {
      console.error('Error al crear pedido:', error)
      res.status(500).json({ error: 'Error al crear pedido' })
    }
  }
)

// PUT - Actualizar estado del pedido (requiere autenticación)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body

    if (!['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: {
          include: {
            dish: true
          }
        }
      }
    })

    res.json(order)
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error)
    res.status(500).json({ error: 'Error al actualizar estado del pedido' })
  }
})

// DELETE - Cancelar pedido (requiere autenticación)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    })
    
    res.json({ message: 'Pedido cancelado correctamente' })
  } catch (error) {
    console.error('Error al cancelar pedido:', error)
    res.status(500).json({ error: 'Error al cancelar pedido' })
  }
})

export default router
