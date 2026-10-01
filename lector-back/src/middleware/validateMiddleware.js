import { ApiError } from '../utils/apiError.js'

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      if (parsed.body) req.body = parsed.body
      if (parsed.query) req.query = parsed.query
      if (parsed.params) req.params = parsed.params

      next()
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map(err => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }))
        const firstMessage = details[0]?.message || 'Datos de entrada inválidos'
        return next(new ApiError(400, firstMessage, details))
      }
      next(error)
    }
  }
}
