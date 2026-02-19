import express from 'express';
import prisma from '../config/database.js';
import { userAuthMiddleware } from '../middleware/userAuth.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

const router = express.Router();
// Crear reserva como admin (aprobada directamente)
router.post('/admin', adminAuthMiddleware, async (req, res) => {
  try {
    const { fechaReserva, cantidadPersonas, tipo, comentarios, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }
    const reserva = await prisma.reserva.create({
      data: {
        userId,
        fechaReserva: new Date(fechaReserva),
        cantidadPersonas,
        tipo,
        comentarios,
        estado: 'aprobada',
      },
    });
    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear reserva como admin:', error);
    res.status(500).json({ error: 'Error al crear reserva como admin' });
  }
});

// Eliminar reserva (admin, cualquier estado)
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({ where: { id: req.params.id } });
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    await prisma.reserva.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar reserva (admin):', error);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
});

// Crear reserva (usuario logueado)
router.post('/', userAuthMiddleware, async (req, res) => {
  try {
    const { fechaReserva, cantidadPersonas, tipo, comentarios } = req.body;
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
      // Obtener nombre del usuario para la notificación
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true }
      });
      // Notificación para admin: nueva reserva pendiente
      await prisma.notification.create({
        data: {
          title: 'Nueva reserva pendiente',
          message: `El usuario ${user?.name || req.user.id} ha solicitado una reserva para el ${new Date(fechaReserva).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}.`,
          type: 'alerta',
          actionLabel: 'Revisar reservas',
          actionUrl: '/admin/reservas'
        }
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

// Eliminar reserva (usuario, solo si es suya y pendiente)
router.delete('/mis/:id', userAuthMiddleware, async (req, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({ where: { id: req.params.id } });
    if (!reserva || reserva.userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    if (reserva.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo puedes eliminar reservas pendientes' });
    }
    await prisma.reserva.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error al eliminar reserva' });
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
    // Notificación para el usuario
    let notifTitle = '', notifMsg = '', notifType = 'reserva';
    if (estado === 'aprobada') {
      notifTitle = 'Reserva confirmada';
      notifMsg = `Tu reserva para ${reserva.cantidadPersonas} personas el ${reserva.fechaReserva.toLocaleString('es-ES')} ha sido confirmada.`;
    } else if (estado === 'rechazada') {
      notifTitle = 'Reserva rechazada';
      notifMsg = `Lamentamos informarte que tu reserva para el ${reserva.fechaReserva.toLocaleString('es-ES')} no pudo ser confirmada.`;
    }
    if (notifTitle) {
      await prisma.notification.create({
        data: {
          userId: reserva.userId,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          actionLabel: 'Ver reserva',
          actionUrl: '/reservas'
        }
      });
    }
    // Notificación para admin: nueva reserva pendiente
    if (estado === 'pendiente') {
      await prisma.notification.create({
        data: {
          title: 'Nueva reserva pendiente',
          message: `El usuario ${reserva.userId} ha solicitado una reserva para el ${reserva.fechaReserva.toLocaleString('es-ES')}.`,
          type: 'alerta',
          actionLabel: 'Revisar reservas',
          actionUrl: '/admin/reservas'
        }
      });
    }
    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

export default router;
