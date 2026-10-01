import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario propietario es obligatorio'],
      index: true,
    },
    localId: {
      type: String,
      trim: true,
      default: null,
      description: 'Identificador del libro en IndexedDB local para sincronización',
    },
    title: {
      type: String,
      required: [true, 'El título del documento es obligatorio'],
      trim: true,
      maxlength: [255, 'El título no puede superar 255 caracteres'],
    },
    originalName: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'Desconocido',
    },
    genre: {
      type: String,
      trim: true,
      default: 'Otro',
    },
    priority: {
      type: String,
      enum: ['Alta', 'Media', 'Baja'],
      default: 'Media',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    coverColor: {
      type: String,
      default: 'from-indigo-600 to-purple-800',
    },
    fileUrl: {
      type: String,
      default: null,
      description: 'Referencia/URL al archivo PDF en almacenamiento remoto (S3, Cloudinary, etc.)',
    },
    storageReference: {
      type: String,
      default: null,
      description: 'Clave o ID del objeto en el proveedor de storage',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    currentPage: {
      type: Number,
      default: 1,
      min: [1, 'La página actual no puede ser menor a 1'],
    },
    numPages: {
      type: Number,
      default: 0,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
      description: 'Porcentaje de lectura entre 0.0 y 1.0',
    },
    readingTimeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound indexes for user library queries and sync
documentSchema.index({ userId: 1, lastOpenedAt: -1 })
documentSchema.index({ userId: 1, localId: 1 })
documentSchema.index({ userId: 1, createdAt: -1 })

export const Document = mongoose.model('Document', documentSchema)
