import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router();

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
  adminAuthMiddleware,
  (req, res, next) => {
    // Si es JSON, saltamos multer
    if (req.headers['content-type']?.includes('application/json')) {
      return next()
    }
    // Si es FormData, usamos multer
    upload.single('image')(req, res, next)
  },
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('category').notEmpty().withMessage('La categoría es requerida')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      console.log('📥 Body recibido:', {
        name: req.body.name,
        image: req.body.image,
        hasFile: !!req.file,
        contentType: req.headers['content-type']
      })

      const { name, description, price, categoryId, available } = req.body
      let image = null
      
      // Si hay un archivo subido, usar la ruta local
      if (req.file) {
        image = `/uploads/${req.file.filename}`
        console.log('✅ Usando archivo subido:', image)
      }
      // Si viene una URL externa en el body (imageUrl), usarla directamente
      else if (req.body.imageUrl && req.body.imageUrl.startsWith('http')) {
        image = req.body.imageUrl
        console.log('✅ Usando imageUrl externa:', image)
      }
      // Si viene una URL externa en el body (image), usarla directamente (compatibilidad)
      else if (req.body.image && req.body.image.startsWith('http')) {
        image = req.body.image
        console.log('✅ Usando image externa:', image)
      }

      console.log('💾 Guardando plato con imagen:', image)

      const dish = await prisma.dish.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          categoryId,
          image,
          available: available !== undefined ? (typeof available === 'boolean' ? available : available === 'true') : true
        }
      })

      res.status(201).json(dish)
    } catch (error) {
      console.error('Error al crear plato:', error)
      res.status(500).json({ error: 'Error al crear plato' })
    }
  }

// PUT - Actualizar plato (requiere autenticación)
router.put('/:id', adminAuthMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, categoryId, available } = req.body;
    let image = undefined;

    // Si hay un archivo subido, usar la ruta local
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    // Si viene una URL externa en el body (imageUrl), usarla directamente
    else if (req.body.imageUrl && req.body.imageUrl.startsWith('http')) {
      image = req.body.imageUrl;
    }
    // Si viene una URL externa en el body (image), usarla directamente (compatibilidad)
    else if (req.body.image && req.body.image.startsWith('http')) {
      image = req.body.image;
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(categoryId && { categoryId }),
      ...(available !== undefined && { available: available === 'true' }),
      ...(image !== undefined && { image })
    };

    const dish = await prisma.dish.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(dish);
  } catch (error) {
    console.error('Error al actualizar plato:', error);
    res.status(500).json({ error: 'Error al actualizar plato' });
  }
});

// DELETE - Eliminar plato (requiere autenticación)
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
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
