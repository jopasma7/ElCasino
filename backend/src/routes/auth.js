import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'

const router = express.Router()

// Login de administrador
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' })
    }

    // Por simplicidad, usamos una contraseña fija del .env
    // En producción, deberías tener usuarios en la BD
    const validPassword = await bcrypt.compare(
      password, 
      process.env.ADMIN_PASSWORD_HASH || '$2a$10$XQv4qF0xRqYjXGz8pQYZ3.rHJxYxYxYxYxYxYxYxYxYxYxYxYx'
    )

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Login exitoso',
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ valid: false })
    }

    jwt.verify(token, process.env.JWT_SECRET)
    res.json({ valid: true })
  } catch (error) {
    res.status(401).json({ valid: false })
  }
})

// Generar hash de contraseña (helper para desarrollo)
router.post('/hash-password', async (req, res) => {
  try {
    const { password } = req.body
    const hash = await bcrypt.hash(password, 10)
    res.json({ hash })
  } catch (error) {
    res.status(500).json({ error: 'Error al generar hash' })
  }
})

export default router
