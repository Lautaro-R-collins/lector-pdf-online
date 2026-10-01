import { Router } from 'express'
import authRoutes from './authRoutes.js'
import documentRoutes from './documentRoutes.js'
import annotationRoutes from './annotationRoutes.js'
import { sendSuccess } from '../utils/apiResponse.js'

const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'API en funcionamiento')
})

apiRouter.use('/auth', authRoutes)
apiRouter.use('/documents', documentRoutes)
apiRouter.use('/annotations', annotationRoutes)

export default apiRouter
