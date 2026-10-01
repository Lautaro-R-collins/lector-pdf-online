import { DocumentService } from '../services/documentService.js'
import { sendCreated, sendSuccess } from '../utils/apiResponse.js'

export class DocumentController {
  static async create(req, res, next) {
    try {
      const document = await DocumentService.createDocument(req.user._id, req.body)
      return sendCreated(res, { document }, 'Documento creado exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await DocumentService.getUserDocuments(req.user._id, req.query)
      return sendSuccess(res, result, 'Documentos obtenidos')
    } catch (error) {
      next(error)
    }
  }

  static async getOne(req, res, next) {
    try {
      const document = await DocumentService.getDocumentById(req.user._id, req.params.id)
      return sendSuccess(res, { document }, 'Documento obtenido')
    } catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    try {
      const document = await DocumentService.updateDocument(
        req.user._id,
        req.params.id,
        req.body
      )
      return sendSuccess(res, { document }, 'Documento actualizado exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async updateProgress(req, res, next) {
    try {
      const document = await DocumentService.updateProgress(
        req.user._id,
        req.params.id,
        req.body
      )
      return sendSuccess(res, { document }, 'Progreso de lectura actualizado')
    } catch (error) {
      next(error)
    }
  }

  static async delete(req, res, next) {
    try {
      await DocumentService.deleteDocument(req.user._id, req.params.id)
      return sendSuccess(res, {}, 'Documento eliminado exitosamente')
    } catch (error) {
      next(error)
    }
  }

  static async syncBatch(req, res, next) {
    try {
      const documents = await DocumentService.syncBatch(
        req.user._id,
        req.body.books || []
      )
      return sendSuccess(res, { documents }, 'Biblioteca sincronizada exitosamente')
    } catch (error) {
      next(error)
    }
  }
}
