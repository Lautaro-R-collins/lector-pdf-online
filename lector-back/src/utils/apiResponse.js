export function sendSuccess(res, data = {}, message = 'Operación exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  })
}

export function sendCreated(res, data = {}, message = 'Recurso creado exitosamente') {
  return sendSuccess(res, data, message, 201)
}

export function sendNoContent(res) {
  return res.status(204).send()
}
