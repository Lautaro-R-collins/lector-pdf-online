import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Annotations API (/api/documents/:id/annotations y /api/annotations/:id)', () => {
  let user1Token
  let user2Token
  let documentId

  beforeEach(async () => {
    const u1 = await request(app).post('/api/auth/register').send({
      name: 'Usuario Uno',
      email: 'user1@example.com',
      password: 'password123',
    })
    user1Token = u1.body.accessToken

    const u2 = await request(app).post('/api/auth/register').send({
      name: 'Usuario Dos',
      email: 'user2@example.com',
      password: 'password123',
    })
    user2Token = u2.body.accessToken

    // User 1 creates a document
    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'PDF de Prueba con Anotaciones', numPages: 20 })

    documentId = docRes.body.document.id
  })

  describe('Creación de Anotaciones (Highlights, Notes, Bookmarks)', () => {
    it('debe crear un highlight con rects y texto', async () => {
      const highlightData = {
        type: 'highlight',
        pageNumber: 3,
        color: '#facc15',
        text: 'Texto resaltado importante en el PDF',
        rects: [
          { xPercent: 10.5, yPercent: 20.2, widthPercent: 30.0, heightPercent: 2.5 },
        ],
      }

      const res = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(highlightData)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.annotation.type).toBe('highlight')
      expect(res.body.annotation.text).toBe(highlightData.text)
      expect(res.body.annotation.rects.length).toBe(1)
    })

    it('debe crear una nota (annotation marker) con coordenadas x, y', async () => {
      const noteData = {
        type: 'note',
        pageNumber: 5,
        color: '#f59e0b',
        text: 'Revisar este capítulo para el examen',
        x: 45.5,
        y: 60.2,
      }

      const res = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(noteData)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.annotation.type).toBe('note')
      expect(res.body.annotation.x).toBe(45.5)
      expect(res.body.annotation.y).toBe(60.2)
    })

    it('debe crear un marcador (bookmark)', async () => {
      const bookmarkData = {
        type: 'bookmark',
        pageNumber: 12,
        title: 'Capítulo 3: Patrones de Diseño',
      }

      const res = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(bookmarkData)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.annotation.type).toBe('bookmark')
      expect(res.body.annotation.title).toBe(bookmarkData.title)
    })
  })

  describe('Consulta y filtrado de anotaciones', () => {
    it('debe listar todas las anotaciones y permitir filtrar por tipo', async () => {
      // Create a highlight and a note
      await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ type: 'highlight', pageNumber: 1, text: 'H1' })

      await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ type: 'note', pageNumber: 2, text: 'N1', x: 10, y: 10 })

      // Get all
      const allRes = await request(app)
        .get(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)

      expect(allRes.status).toBe(200)
      expect(allRes.body.annotations.length).toBe(2)

      // Filter by type highlight
      const highlightsRes = await request(app)
        .get(`/api/documents/${documentId}/annotations?type=highlight`)
        .set('Authorization', `Bearer ${user1Token}`)

      expect(highlightsRes.status).toBe(200)
      expect(highlightsRes.body.annotations.length).toBe(1)
      expect(highlightsRes.body.annotations[0].type).toBe('highlight')
    })
  })

  describe('Edición y eliminación de anotaciones', () => {
    it('debe actualizar el contenido de una nota', async () => {
      const created = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ type: 'note', pageNumber: 1, text: 'Texto original', x: 20, y: 20 })

      const annotationId = created.body.annotation.id

      const res = await request(app)
        .patch(`/api/annotations/${annotationId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ text: 'Texto modificado' })

      expect(res.status).toBe(200)
      expect(res.body.annotation.text).toBe('Texto modificado')
    })

    it('debe eliminar una anotación', async () => {
      const created = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ type: 'bookmark', pageNumber: 7, title: 'Marcador a borrar' })

      const annotationId = created.body.annotation.id

      const deleteRes = await request(app)
        .delete(`/api/annotations/${annotationId}`)
        .set('Authorization', `Bearer ${user1Token}`)

      expect(deleteRes.status).toBe(200)

      // Check it no longer exists
      const listRes = await request(app)
        .get(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)

      expect(listRes.body.annotations.length).toBe(0)
    })

    it('debe impedir que el Usuario 2 modifique o elimine anotaciones del Usuario 1 (403 Forbidden)', async () => {
      const created = await request(app)
        .post(`/api/documents/${documentId}/annotations`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ type: 'note', pageNumber: 1, text: 'Nota privada' })

      const annotationId = created.body.annotation.id

      const updateRes = await request(app)
        .patch(`/api/annotations/${annotationId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ text: 'Modificación no autorizada' })

      expect(updateRes.status).toBe(403)

      const deleteRes = await request(app)
        .delete(`/api/annotations/${annotationId}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(deleteRes.status).toBe(403)
    })
  })
})
