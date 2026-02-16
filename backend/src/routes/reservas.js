import express from 'express';
import prisma from '../config/database.js';
import { userAuthMiddleware } from '../middleware/userAuth.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

const router = express.Router();

// Crear reserva (usuario logueado)
router.post('/', userAuthMiddleware, async (req, res) => {
  try {
    const { fechaReserva, cantidadPersonas, tipo, comentarios } = req.body;
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado - usuario no logueado o id inválido' });
    }
    const reserva = await prisma.reserva.create({
      data: {
        userId: req.user.id,
        fechaReserva: new Date(fechaReserva),
        cantidadPersonas,
        tipo,
        comentarios,
      },
    });
    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Obtener reservas del usuario
router.get('/mis', userAuthMiddleware, async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      where: { userId: req.user.id },
      orderBy: { fechaReserva: 'asc' },
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener todas las reservas (admin)
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: { user: true },
      orderBy: { fechaReserva: 'asc' },
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Editar reserva (usuario, solo si está pendiente)
router.put('/mis/:id', userAuthMiddleware, async (req, res) => {
  try {
    const { fechaReserva, cantidadPersonas, tipo, comentarios } = req.body;
    // Solo puede editar su propia reserva y si está pendiente
    const reserva = await prisma.reserva.findUnique({ where: { id: req.params.id } });
    if (!reserva || reserva.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo puedes editar reservas pendientes' });
    }
    // Validar que no exista otra reserva del mismo tipo y fecha para este usuario (excluyendo la actual)
    const existeOtra = await prisma.reserva.findFirst({
      where: {
        userId: req.user.id,
        tipo,
        id: { not: req.params.id },
        fechaReserva: {
          gte: new Date(new Date(fechaReserva).setHours(0,0,0,0)),
          lt: new Date(new Date(fechaReserva).setHours(23,59,59,999))
        }
      }
    });
    if (existeOtra) {
      return res.status(400).json({ error: 'Ya tienes otra reserva para ese día y tipo.' });
    }
    const actualizada = await prisma.reserva.update({
      where: { id: req.params.id },
      data: {
        fechaReserva: new Date(fechaReserva),
        cantidadPersonas,
        tipo,
        comentarios
      }
    });
    res.json(actualizada);
  } catch (error) {
    console.error('Error al editar reserva:', error);
    res.status(500).json({ error: 'Error al editar reserva' });
  }
});

// Aprobar o rechazar reserva (admin)
router.put('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    const reserva = await prisma.reserva.update({
      where: { id: req.params.id },
      data: { estado },
    });
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

export default router;
