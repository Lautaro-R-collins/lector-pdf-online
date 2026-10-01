import mongoose from 'mongoose'

const rectSchema = new mongoose.Schema(
  {
    xPercent: { type: Number, required: true },
    yPercent: { type: Number, required: true },
    widthPercent: { type: Number, required: true },
    heightPercent: { type: Number, required: true },
  },
  { _id: false }
)

const annotationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    localId: {
      type: String,
      default: null,
      description: 'ID generado por el frontend (crypto.randomUUID) para sincronización offline',
    },
    type: {
      type: String,
      enum: ['highlight', 'note', 'bookmark'],
      required: true,
      index: true,
    },
    pageNumber: {
      type: Number,
      required: [true, 'El número de página es obligatorio'],
      min: [1, 'El número de página no puede ser menor a 1'],
    },
    // Highlights & Notes
    color: {
      type: String,
      default: '#facc15',
    },
    // Highlight text or Note body
    text: {
      type: String,
      default: '',
    },
    // Bookmark title
    title: {
      type: String,
      default: '',
    },
    // Note position (pin x, y in percentages 0-100)
    x: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    y: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Highlight rectangles
    rects: {
      type: [rectSchema],
      default: undefined,
    },
    // Generic position structure if needed
    position: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

// Efficient compound indexes
annotationSchema.index({ documentId: 1, type: 1 })
annotationSchema.index({ userId: 1, documentId: 1 })
annotationSchema.index({ documentId: 1, localId: 1 })

export const Annotation = mongoose.model('Annotation', annotationSchema)
