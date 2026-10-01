import { z } from 'zod'

const rectSchema = z.object({
  xPercent: z.number(),
  yPercent: z.number(),
  widthPercent: z.number(),
  heightPercent: z.number(),
})

export const createAnnotationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID del documento es obligatorio'),
  }),
  body: z.object({
    type: z.enum(['highlight', 'note', 'bookmark'], {
      required_error: 'El tipo de anotación es obligatorio (highlight, note, bookmark)',
    }),
    pageNumber: z.number({ required_error: 'El número de página es obligatorio' }).int().min(1),
    localId: z.string().optional(),
    color: z.string().optional(),
    text: z.string().optional(),
    title: z.string().optional(),
    x: z.number().min(0).max(100).nullable().optional(),
    y: z.number().min(0).max(100).nullable().optional(),
    rects: z.array(rectSchema).optional(),
    position: z.any().optional(),
  }),
})

export const updateAnnotationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID de la anotación es obligatorio'),
  }),
  body: z.object({
    color: z.string().optional(),
    text: z.string().optional(),
    title: z.string().optional(),
    x: z.number().min(0).max(100).nullable().optional(),
    y: z.number().min(0).max(100).nullable().optional(),
    rects: z.array(rectSchema).optional(),
    position: z.any().optional(),
  }),
})

export const annotationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID de la anotación es obligatorio'),
  }),
})

export const batchSyncAnnotationsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'El ID del documento es obligatorio'),
  }),
  body: z.object({
    annotations: z.array(
      z.object({
        localId: z.string().optional(),
        type: z.enum(['highlight', 'note', 'bookmark']),
        pageNumber: z.number().int().min(1),
        color: z.string().optional(),
        text: z.string().optional(),
        title: z.string().optional(),
        x: z.number().min(0).max(100).nullable().optional(),
        y: z.number().min(0).max(100).nullable().optional(),
        rects: z.array(rectSchema).optional(),
        position: z.any().optional(),
      })
    ),
  }),
})
