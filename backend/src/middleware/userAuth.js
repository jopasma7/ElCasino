import jwt from 'jsonwebtoken'

export const userAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Permitir acceso a usuarios con rol 'Usuario' o 'Administrador'
    if (!['Usuario', 'Administrador'].includes(decoded.role)) {
      return res.status(403).json({ error: 'No autorizado - Token de usuario requerido' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado - Token inválido' })
  }
}

export const optionalUserAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role === 'user') {
      req.user = decoded
    }

    next()
  } catch (error) {
    next()
  }
}
