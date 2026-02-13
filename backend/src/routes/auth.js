import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'

const router = express.Router()

// Endpoints de login/verify eliminados: ya no necesarios

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
