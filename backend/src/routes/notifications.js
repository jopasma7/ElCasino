import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userAuthMiddleware } from '../middleware/userAuth.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';
const router = express.Router();
const prisma = new PrismaClient();

// Obtener notificaciones del usuario actual
router.get('/', userAuthMiddleware, async (req, res) => {
  try {
    let notifications = [];
    if (req.user.role === 'Administrador') {
      notifications = await prisma.notification.findMany({ orderBy: { date: 'desc' } });
    } else {
      notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' }
      });
    }
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar notificación como leída
router.patch('/:id/read', userAuthMiddleware, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
});

// Crear notificación (admin)
router.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { userId, title, message, type, actionLabel, actionUrl } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, actionLabel, actionUrl }
    });
    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear notificación' });
  }
});

// Eliminar notificación (admin)
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

export default router;
