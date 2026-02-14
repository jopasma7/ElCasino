import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear nueva categoría
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'La categoría ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const category = await prisma.category.update({ where: { id }, data: { name } });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    if (error.code === 'P2003' || (error.message && error.message.includes('Foreign key constraint')) ) {
      return res.status(400).json({ error: 'No se puede eliminar una categoría que contiene platos. Elimina o reasigna los platos primero.' });
    }
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }

});

export default router;
