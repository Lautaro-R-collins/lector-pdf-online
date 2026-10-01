import { AnnotationService } from '../services/annotationService.js'
import { sendCreated, sendSuccess } from '../utils/apiResponse.js'

export class AnnotationController {
  static async create(req, res, next) {
    try {
      const annotation = await AnnotationService.createAnnotation(
        req.user._id,
        req.params.id,
        req.body
      )
      return sendCreated(res, { annotation }, 'Anotación creada exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async getByDocument(req, res, next) {
    try {
      const { type } = req.query
      const annotations = await AnnotationService.getAnnotationsByDocument(
        req.user._id,
        req.params.id,
        type
      )
      return sendSuccess(res, { annotations }, 'Anotaciones obtenidas')
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const annotation = await AnnotationService.updateAnnotation(
        req.user._id,
        req.params.id,
        req.body
      )
      return sendSuccess(res, { annotation }, 'Anotación actualizada exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      await AnnotationService.deleteAnnotation(req.user._id, req.params.id)
      return sendSuccess(res, {}, 'Anotación eliminada exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async batchSync(req, res, next) {
    try {
      const annotations = await AnnotationService.batchSync(
        req.user._id,
        req.params.id,
        req.body.annotations || []
      )
      return sendSuccess(res, { annotations }, 'Anotaciones sincronizadas')
    } catch (error) {
      next(error)
    }
  }
}
