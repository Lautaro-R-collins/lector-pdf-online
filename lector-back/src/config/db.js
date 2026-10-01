import mongoose from 'mongoose'
import { config } from './env.js'

export async function connectDB(customUri = null) {
  const uri = customUri || config.mongodbUri

  try {
    const conn = await mongoose.connect(uri)
    console.log(`[MongoDB] Conectado exitosamente: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error(`[MongoDB] Error de conexión: ${error.message}`)
    if (config.isProduction) {
      process.exit(1)
    }
    throw error
  }
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close()
    console.log('[MongoDB] Conexión cerrada.')
  } catch (error) {
    console.error(`[MongoDB] Error al desconectar: ${error.message}`)
  }
}
