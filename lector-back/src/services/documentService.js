import mongoose from 'mongoose'
import { Document } from '../models/Document.js'
import { Annotation } from '../models/Annotation.js'
import { ApiError } from '../utils/apiError.js'

export class DocumentService {
  static async createDocument(userId, data) {
    // If localId is supplied, check if already exists for this user (upsert / sync)
    if (data.localId) {
      const existing = await Document.findOne({ userId, localId: data.localId })
      if (existing) {
        Object.assign(existing, data)
        await existing.save()
        return existing
      }
    }

    const document = new Document({
      ...data,
      userId,
    })

    await document.save()
    return document
  }

  static async getUserDocuments(userId, options = {}) {
    const {
      page = 1,
      limit = 50,
      search,
      genre,
      priority,
      sortBy = 'recent',
    } = options

    const query = { userId }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ]
    }

    if (genre && genre !== 'Todos') {
      query.genre = genre
    }

    if (priority && priority !== 'Todas') {
      query.priority = priority
    }

    // Sort order
    let sort = { lastOpenedAt: -1 }
    if (sortBy === 'title') sort = { title: 1 }
    else if (sortBy === 'priority') sort = { priority: 1, createdAt: -1 }
    else if (sortBy === 'progress') sort = { progress: -1 }
    else if (sortBy === 'recent') sort = { updatedAt: -1, createdAt: -1 }

    const skip = (page - 1) * limit

    const [documents, total] = await Promise.all([
      Document.find(query).sort(sort).skip(skip).limit(limit),
      Document.countDocuments(query),
    ])

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  static async getDocumentById(userId, documentId) {
    let document
    if (mongoose.Types.ObjectId.isValid(documentId)) {
      document = await Document.findById(documentId)
    } else {
      // Support finding by localId
      document = await Document.findOne({ localId: documentId, userId })
    }

    if (!document) {
      throw ApiError.notFound('Documento no encontrado')
    }

    if (document.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('No tiene permiso para acceder a este documento')
    }

    return document
  }

  static async updateDocument(userId, documentId, updates) {
    const document = await this.getDocumentById(userId, documentId)

    // Disallow overriding ownership or internal IDs
    delete updates.userId
    delete updates._id
    delete updates.id

    Object.assign(document, updates)
    await document.save()
    return document
  }

  static async updateProgress(userId, documentId, { currentPage, progress, numPages, readingTimeSeconds }) {
    const document = await this.getDocumentById(userId, documentId)

    document.currentPage = currentPage
    document.lastOpenedAt = new Date()

    if (numPages !== undefined && numPages > 0) {
      document.numPages = numPages
    }

    if (progress !== undefined) {
      document.progress = Math.min(1, Math.max(0, progress))
    } else if (document.numPages > 0) {
      document.progress = Math.min(1, Math.max(0, currentPage / document.numPages))
    }

    if (readingTimeSeconds !== undefined) {
      document.readingTimeSeconds = (document.readingTimeSeconds || 0) + readingTimeSeconds
    }

    await document.save()
    return document
  }

  static async deleteDocument(userId, documentId) {
    const document = await this.getDocumentById(userId, documentId)

    // Delete associated annotations
    await Annotation.deleteMany({ documentId: document._id, userId })

    await Document.findByIdAndDelete(document._id)
    return { id: document._id }
  }

  static async syncBatch(userId, localBooks = []) {
    const syncedDocuments = []

    for (const book of localBooks) {
      const docData = {
        localId: book.id,
        title: book.title || book.fileName?.replace(/\.pdf$/i, '') || 'Sin título',
        author: book.author || 'Desconocido',
        genre: book.genre || 'Otro',
        priority: book.priority || 'Media',
        rating: book.rating || 0,
        coverColor: book.coverColor,
        currentPage: book.currentPage || 1,
        numPages: book.numPages || 0,
        fileName: book.fileName || '',
        progress: book.numPages ? (book.currentPage / book.numPages) : 0,
        lastOpenedAt: book.lastOpenedAt || book.createdAt || new Date(),
      }

      const doc = await this.createDocument(userId, docData)
      syncedDocuments.push(doc)
    }

    return syncedDocuments
  }
}
