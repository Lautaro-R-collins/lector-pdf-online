import { ApiError } from '../utils/apiError.js'
import { config } from '../config/env.js'

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  let error = err

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Recurso no encontrado con id: ${err.value}`
    error = new ApiError(400, message)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo'
    const message = `Ya existe un registro con ese valor para: ${field}`
    error = new ApiError(409, message)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    error = new ApiError(400, message)
  }

  // JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ApiError(400, 'JSON malformado en el cuerpo de la petición')
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Error interno del servidor'

  const response = {
    success: false,
    message,
    ...(error.details && { details: error.details }),
    ...(!config.isProduction && { stack: error.stack }),
  }

  if (statusCode === 500) {
    console.error('[Error No Manejado]:', err)
  }

  res.status(statusCode).json(response)
}
