import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database.js'
import { upload } from '../middleware/upload.js'
import { userAuthMiddleware } from '../middleware/userAuth.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = express.Router()

// Registro de usuario (con avatar opcional)
router.post('/register',
  upload.single('avatar'),
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('phone')
      .notEmpty().withMessage('El teléfono es requerido')
      .matches(/^[0-9]{7,15}$/).withMessage('El teléfono debe contener solo números (7-15 dígitos)'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('email').isEmail().withMessage('Email inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, phone, email, password } = req.body

      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { phone },
            { email }
          ]
        }
      })

      if (existing) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese teléfono o email' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const avatar = req.file ? `/uploads/${req.file.filename}` : null

      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email,
          passwordHash,
          avatar
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
          createdAt: true
        }
      })

      const token = jwt.sign(
        { role: 'user', userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      )

      res.status(201).json({ user, token })
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      res.status(500).json({ error: 'Error al registrar usuario' })
    }
  }
)

// Login de usuario
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash)
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      const token = jwt.sign(
        { role: 'user', userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      )

      res.json({
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar
        },
        token
      })
    } catch (error) {
      console.error('Error en login de usuario:', error)
      res.status(500).json({ error: 'Error al iniciar sesión' })
    }
  }
)

// Perfil del usuario autenticado
router.get('/me', userAuthMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

// Eliminar cuenta del usuario autenticado
router.delete('/me', userAuthMiddleware, async (req, res) => {
  try {
    // Elimina el usuario de la base de datos
    await prisma.user.delete({ where: { id: req.user.userId } })
    res.json({ message: 'Cuenta eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
    res.status(500).json({ error: 'Error al eliminar la cuenta' })
  }
})

// Actualizar perfil
router.put('/me',
  userAuthMiddleware,
  upload.single('avatar'),
  [
    body('name').optional().notEmpty().withMessage('Nombre inválido'),
    body('phone').optional().notEmpty().withMessage('Teléfono inválido'),
    body('email').optional().isEmail().withMessage('Email inválido')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, phone, email } = req.body
      const avatar = req.file ? `/uploads/${req.file.filename}` : undefined

      if (phone || email) {
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              ...(phone ? [{ phone }] : []),
              ...(email ? [{ email }] : [])
            ],
            NOT: { id: req.user.userId }
          }
        })

        if (existing) {
          return res.status(409).json({ error: 'Teléfono o email ya en uso' })
        }
      }

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email !== undefined && { email: email || null }),
          ...(avatar && { avatar })
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
          createdAt: true
        }
      })

      res.json(user)
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      res.status(500).json({ error: 'Error al actualizar perfil' })
    }
  }
)

// Cambiar rol de usuario (solo admin)
router.put('/:id/role', adminAuthMiddleware, async (req, res) => {
  try {
    const { role } = req.body
    if (!['Usuario', 'Administrador'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' })
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true
      }
    })
    res.json(user)
  } catch (error) {
    console.error('Error al cambiar rol:', error)
    res.status(500).json({ error: 'Error al cambiar rol' })
  }
})

// Eliminar usuario por id (solo admin)
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

export default router
