import app from './app.js'
import { config } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'

async function startServer() {
  try {
    const server = app.listen(config.port, () => {
      console.log(`
Servidor Lector PDF Backend iniciado correctamente
Modo: ${config.nodeEnv}
URL: http://localhost:${config.port}
Health Check: http://localhost:${config.port}/api/health
Frontend Permitido (CORS): ${config.clientUrl}
      `)
    })

    // Connect to database
    await connectDB()

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Señal ${signal} recibida. Cerrando servidor de forma ordenada...`)
      server.close(async () => {
        await disconnectDB()
        console.log('[Server] Servidor y conexiones cerradas exitosamente.')
        process.exit(0)
      })

      // Force shutdown after 10 seconds if hanging
      setTimeout(() => {
        console.error('[Server] Cierre forzado tras tiempo de espera.')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGINT', () => handleShutdown('SIGINT'))
    process.on('SIGTERM', () => handleShutdown('SIGTERM'))
  } catch (error) {
    console.error('Error al inicializar el servidor:', error)
    process.exit(1)
  }
}

startServer()
