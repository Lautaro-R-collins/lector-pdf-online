import { z } from 'zod'

const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const documentIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID del documento es obligatorio'),
  }),
})

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'El título es obligatorio' }).trim().min(1, 'El título no puede estar vacío').max(255),
    localId: z.string().trim().optional(),
    originalName: z.string().trim().optional(),
    fileName: z.string().trim().optional(),
    author: z.string().trim().optional(),
    genre: z.string().trim().optional(),
    priority: z.enum(['Alta', 'Media', 'Baja']).optional(),
    rating: z.number().min(0).max(5).optional(),
    coverColor: z.string().optional(),
    fileUrl: z.string().nullable().optional(),
    fileSize: z.number().min(0).optional(),
    mimeType: z.string().optional(),
    currentPage: z.number().int().min(1).optional(),
    numPages: z.number().int().min(0).optional(),
    progress: z.number().min(0).max(1).optional(),
    readingTimeSeconds: z.number().min(0).optional(),
  }),
})

export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID es obligatorio'),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(255).optional(),
    originalName: z.string().trim().optional(),
    fileName: z.string().trim().optional(),
    author: z.string().trim().optional(),
    genre: z.string().trim().optional(),
    priority: z.enum(['Alta', 'Media', 'Baja']).optional(),
    rating: z.number().min(0).max(5).optional(),
    coverColor: z.string().optional(),
    fileUrl: z.string().nullable().optional(),
    fileSize: z.number().min(0).optional(),
    currentPage: z.number().int().min(1).optional(),
    numPages: z.number().int().min(0).optional(),
    progress: z.number().min(0).max(1).optional(),
  }),
})

export const updateProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID es obligatorio'),
  }),
  body: z.object({
    currentPage: z.number({ required_error: 'La página actual es requerida' }).int().min(1),
    progress: z.number().min(0).max(1).optional(),
    numPages: z.number().int().min(0).optional(),
    readingTimeSeconds: z.number().min(0).optional(),
  }),
})

export const listDocumentsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    genre: z.string().optional(),
    priority: z.string().optional(),
    sortBy: z.enum(['recent', 'title', 'priority', 'progress']).optional(),
  }).optional(),
})
