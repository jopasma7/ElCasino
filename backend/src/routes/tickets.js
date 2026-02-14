import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Obtener ticket por mesa
router.get('/:mesa', async (req, res) => {
  const mesa = Number(req.params.mesa)
  try {
    const ticket = await prisma.ticket.findFirst({
      where: { mesa, status: 'open' },
      include: { items: { include: { dish: true } } }
    })
    res.json(ticket)
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener ticket', details: e.message })
  }
})

// Crear o actualizar ticket
router.post('/:mesa', async (req, res) => {
  const mesa = Number(req.params.mesa);
  const { name, items } = req.body;
  try {
    let ticket = await prisma.ticket.findFirst({ where: { mesa, status: 'open' } });
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: { mesa, name, status: 'open' }
      });
    } else {
      ticket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { name }
      });
    }
    // Actualizar items
    await prisma.ticketItem.deleteMany({ where: { ticketId: ticket.id } });
    for (const item of items) {
      await prisma.ticketItem.create({
        data: {
          ticketId: ticket.id,
          dishId: item.dishId,
          cantidad: item.cantidad,
          price: item.price,
          customOptions: item.customOptions ? item.customOptions : undefined
        }
      });
    }
    const updated = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: { items: { include: { dish: true } } }
    });
    // Emitir evento WebSocket después de actualizar el ticket
    const io = req.app.get('io');
    if (io) {
      io.to(`mesa-${mesa}`).emit('ticketUpdated', updated);
    }
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Error al actualizar ticket', details: e.message });
  }
})

// Cerrar ticket
router.post('/:mesa/close', async (req, res) => {
  const mesa = Number(req.params.mesa)
  try {
    const ticket = await prisma.ticket.findFirst({ where: { mesa, status: 'open' } })
    if (!ticket) return res.json({ success: true }) // Idempotente: si no existe, también success
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'closed' }
    })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Error al cerrar ticket', details: e.message })
  }
})

export default router
