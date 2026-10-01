import { Router } from 'express'
import { DocumentController } from '../controllers/documentController.js'
import { AnnotationController } from '../controllers/annotationController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import {
  createDocumentSchema,
  updateDocumentSchema,
  updateProgressSchema,
  documentIdParamSchema,
  listDocumentsQuerySchema,
} from '../validators/documentValidators.js'
import {
  createAnnotationSchema,
  batchSyncAnnotationsSchema,
} from '../validators/annotationValidators.js'

const router = Router()

// All document operations require authentication
router.use(authenticate)

// Document CRUD & Library
router.get('/', validate(listDocumentsQuerySchema), DocumentController.getAll)
router.post('/', validate(createDocumentSchema), DocumentController.create)
router.post('/sync', DocumentController.syncBatch)

router.get('/:id', validate(documentIdParamSchema), DocumentController.getOne)
router.patch('/:id', validate(updateDocumentSchema), DocumentController.update)
router.delete('/:id', validate(documentIdParamSchema), DocumentController.delete)

// Progress Synchronization
router.patch(
  '/:id/progress',
  validate(updateProgressSchema),
  DocumentController.updateProgress
)

// Document Annotations (Highlights, Bookmarks, Notes)
router.get(
  '/:id/annotations',
  validate(documentIdParamSchema),
  AnnotationController.getByDocument
)

router.post(
  '/:id/annotations',
  validate(createAnnotationSchema),
  AnnotationController.create
)

router.post(
  '/:id/annotations/sync',
  validate(batchSyncAnnotationsSchema),
  AnnotationController.batchSync
)

export default router
