import { Router } from 'express'
import { AnnotationController } from '../controllers/annotationController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import {
  updateAnnotationSchema,
  annotationIdParamSchema,
} from '../validators/annotationValidators.js'

const router = Router()

// All annotation operations require authentication
router.use(authenticate)

router.patch('/:id', validate(updateAnnotationSchema), AnnotationController.update)
router.delete('/:id', validate(annotationIdParamSchema), AnnotationController.delete)

export default router
