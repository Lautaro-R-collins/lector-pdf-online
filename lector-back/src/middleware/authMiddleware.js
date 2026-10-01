import { verifyAccessToken } from '../utils/tokenUtils.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/apiError.js'

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('No se proporcionó un token de autorización válido'))
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('El token de acceso ha expirado'))
      }
      return next(ApiError.unauthorized('Token de acceso inválido'))
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return next(ApiError.unauthorized('El usuario asociado al token ya no existe'))
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null
      return next()
    }

    const token = authHeader.split(' ')[1]
    try {
      const decoded = verifyAccessToken(token)
      const user = await User.findById(decoded.id)
      req.user = user || null
    } catch {
      req.user = null
    }

    next()
  } catch {
    req.user = null
    next()
  }
}
