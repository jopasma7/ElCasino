import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'
import { optionalUserAuthMiddleware } from '../middleware/userAuth.js'

const router = express.Router()

// GET - Obtener todos los pedidos (requiere autenticación)
router.get('/', adminAuthMiddleware, async (req, res) => {
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
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        items: {
          include: {
            dish: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    // Añadir isDailyMenu a cada pedido si todos los items tienen price 0
    const ordersWithFlag = orders.map(order => ({
      ...order,
      isDailyMenu: order.items.length > 0 && order.items.every(i => i.price === 0)
    }));
    res.json(ordersWithFlag)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    res.status(500).json({ error: 'Error al obtener pedidos' })
  }
})

// GET - Obtener un pedido por ID (requiere autenticación)
router.get('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
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
    // Añadir isDailyMenu si todos los items tienen price 0
    const isDailyMenu = order.items.length > 0 && order.items.every(i => i.price === 0);
    res.json({ ...order, isDailyMenu })
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    res.status(500).json({ error: 'Error al obtener pedido' })
  }
})

// POST - Crear nuevo pedido (admin, sin requerir teléfono)
router.post('/admin', adminAuthMiddleware, [
  body('customerName').notEmpty().withMessage('El nombre es requerido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.dishId').custom((value, { req, path }) => {
    if (req.body.isDailyMenu && (!value || value === '')) {
      return true;
    }
    if (!value || value === '') {
      throw new Error('Dish ID es requerido');
    }
    return true;
  }),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      customerName,
      items,
      isDailyMenu,
      status,
      type
    } = req.body;
    // Procesar items y crear pedido
    let subtotal = 0;
    const orderItems = items.map(item => ({
      dishName: item.dishName,
      quantity: item.quantity,
      price: 0
    }));
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone: '000000000',
        status: 'confirmed',
        type: type || 'takeaway',
        subtotal: 0,
        total: 0,
        customerAddress: '',
        notes: '',
        // price eliminado, solo subtotal y total
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error al crear pedido (admin):', error);
    res.status(500).json({ error: 'Error al crear pedido (admin)' });
  }
});

// POST - Crear nuevo pedido (público)
router.post('/',
  optionalUserAuthMiddleware,
  [
    body('type').isIn(['takeaway', 'dinein']).withMessage('Tipo de pedido inválido'),
    body('customerName').notEmpty().withMessage('El nombre es requerido'),
    body('customerPhone').notEmpty().withMessage('El teléfono es requerido'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
    // Permitir items sin dishId si esDailyMenu
    body('items.*.dishId').custom((value, { req, path }) => {
      if (req.body.isDailyMenu && (!value || value === '')) {
        // Si es menú del día y no hay dishId, permitir
        return true;
      }
      if (!value || value === '') {
        throw new Error('Dish ID es requerido');
      }
      return true;
    }),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0')
  ],
  async (req, res) => {
    try {
      console.log('Pedido recibido:', JSON.stringify(req.body, null, 2));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
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
        let dish = null;
        if (item.dishId) {
          dish = await prisma.dish.findUnique({
            where: { id: item.dishId }
          });
          if (!dish) {
            return res.status(404).json({ 
              error: `Plato con ID ${item.dishId} no encontrado` 
            });
          }
          if (!req.body.isDailyMenu && !dish.available) {
            return res.status(400).json({ 
              error: `El plato ${dish.name} no está disponible` 
            })
          }
          orderItems.push({
            dishId: dish.id,
            name: dish.name,
            quantity: item.quantity,
            price: item.price,
            menuGroup: item.menuGroup ?? null
          });
          subtotal += item.price * item.quantity;
        } else if (req.body.isDailyMenu && item.dishName) {
          // Solo dishName, sin dishId ni relación
          orderItems.push({
            dishName: item.dishName,
            quantity: item.quantity,
            price: item.price,
            menuGroup: item.menuGroup ?? null
          });
          subtotal += item.price * item.quantity;
        }
      }

      // Si esDailyMenu, usar el precio del menú como total
      let total = subtotal;
      if (req.body.isDailyMenu && items.length > 0) {
        // Buscar el precio del menú en el primer item del carrito
        // El frontend envía el precio en el objeto principal, no en los items
        total = req.body.itemsPrice || req.body.total || 0;
        if (!total) {
          // Fallback: intenta obtener el precio del menú desde el frontend
          total = req.body.price || 0;
        }
      }

      // Crear el pedido
      const order = await prisma.order.create({
        data: {
          type,
          customerName,
          customerPhone,
          customerAddress: type === 'delivery' ? customerAddress : null,
          notes,
          userId: req.user?.userId || null,
          subtotal,
          total,
          items: {
            create: orderItems
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatar: true
            }
          },
          items: true
        }
      })

      res.status(201).json(order)
    } catch (error) {
      console.error('Error al crear pedido:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      } else {
        res.status(500).json({ error: 'Error al crear pedido', details: error });
      }
    }
  }
)

// PUT - Actualizar estado del pedido (requiere autenticación)
router.put('/:id/status', adminAuthMiddleware, async (req, res) => {
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
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
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
