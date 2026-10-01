import mongoose from 'mongoose'
import { Annotation } from '../models/Annotation.js'
import { DocumentService } from './documentService.js'
import { ApiError } from '../utils/apiError.js'

export class AnnotationService {
  static async createAnnotation(userId, documentId, data) {
    const document = await DocumentService.getDocumentById(userId, documentId)

    // Upsert by localId if provided
    if (data.localId) {
      const existing = await Annotation.findOne({
        documentId: document._id,
        userId,
        localId: data.localId,
      })

      if (existing) {
        Object.assign(existing, data)
        await existing.save()
        return existing
      }
    }

    const annotation = new Annotation({
      ...data,
      userId,
      documentId: document._id,
    })

    await annotation.save()
    return annotation
  }

  static async getAnnotationsByDocument(userId, documentId, type = null) {
    const document = await DocumentService.getDocumentById(userId, documentId)

    const query = {
      documentId: document._id,
      userId,
    }

    if (type) {
      query.type = type
    }

    const annotations = await Annotation.find(query).sort({
      pageNumber: 1,
      createdAt: 1,
    })

    return annotations
  }

  static async getAnnotationById(userId, annotationId) {
    let annotation
    if (mongoose.Types.ObjectId.isValid(annotationId)) {
      annotation = await Annotation.findById(annotationId)
    } else {
      annotation = await Annotation.findOne({ localId: annotationId, userId })
    }

    if (!annotation) {
      throw ApiError.notFound('Anotación no encontrada')
    }

    if (annotation.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('No tiene permiso para acceder a esta anotación')
    }

    return annotation
  }

  static async updateAnnotation(userId, annotationId, updates) {
    const annotation = await this.getAnnotationById(userId, annotationId)

    delete updates.userId
    delete updates.documentId
    delete updates._id
    delete updates.id

    Object.assign(annotation, updates)
    await annotation.save()
    return annotation
  }

  static async deleteAnnotation(userId, annotationId) {
    const annotation = await this.getAnnotationById(userId, annotationId)

    await Annotation.findByIdAndDelete(annotation._id)
    return { id: annotation._id }
  }

  static async batchSync(userId, documentId, annotationsList = []) {
    const document = await DocumentService.getDocumentById(userId, documentId)
    const synced = []

    for (const item of annotationsList) {
      if (item.localId) {
        const existing = await Annotation.findOne({
          documentId: document._id,
          userId,
          localId: item.localId,
        })
        if (existing) {
          Object.assign(existing, item)
          await existing.save()
          synced.push(existing)
          continue
        }
      }

      const created = new Annotation({
        ...item,
        documentId: document._id,
        userId,
      })
      await created.save()
      synced.push(created)
    }

    return synced
  }
}
