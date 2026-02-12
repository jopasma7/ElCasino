import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado - Se requieren permisos de admin' })
    }
    req.admin = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado - Token inválido' })
  }
}
