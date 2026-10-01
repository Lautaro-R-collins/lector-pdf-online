import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Documents API (/api/documents)', () => {
  let user1Token
  let user2Token

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
  })

  describe('Creación y lectura de documentos', () => {
    it('debe crear un nuevo documento para el usuario autenticado', async () => {
      const res = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Clean Architecture',
          author: 'Robert C. Martin',
          genre: 'Tecnología',
          priority: 'Alta',
          numPages: 350,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.document).toBeDefined()
      expect(res.body.document.title).toBe('Clean Architecture')
      expect(res.body.document.currentPage).toBe(1)
      expect(res.body.document.progress).toBe(0)
    })

    it('debe listar los documentos del usuario', async () => {
      await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Libro 1', author: 'Autor A' })

      await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Libro 2', author: 'Autor B' })

      const res = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)

      expect(res.status).toBe(200)
      expect(res.body.documents.length).toBe(2)
    })
  })

  describe('Control de propiedad (Ownership) y seguridad', () => {
    it('debe impedir que el Usuario 2 acceda a un documento del Usuario 1 (403 Forbidden)', async () => {
      // User 1 creates doc
      const created = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Documento Privado de User 1' })

      const docId = created.body.document.id

      // User 2 tries to read docId
      const res = await request(app)
        .get(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('permiso')
    })

    it('debe impedir que el Usuario 2 actualice o elimine un documento del Usuario 1', async () => {
      const created = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Documento Intocable' })

      const docId = created.body.document.id

      // User 2 tries to update
      const updateRes = await request(app)
        .patch(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hackeado' })

      expect(updateRes.status).toBe(403)

      // User 2 tries to delete
      const deleteRes = await request(app)
        .delete(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(deleteRes.status).toBe(403)
    })
  })

  describe('Actualización de progreso (/api/documents/:id/progress)', () => {
    it('debe actualizar la página actual y recalcular el progreso', async () => {
      const created = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'El Principito',
          numPages: 100,
        })

      const docId = created.body.document.id

      const res = await request(app)
        .patch(`/api/documents/${docId}/progress`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          currentPage: 50,
          progress: 0.5,
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.document.currentPage).toBe(50)
      expect(res.body.document.progress).toBe(0.5)
      expect(res.body.document.lastOpenedAt).toBeDefined()
    })

    it('debe fallar si la página actual es menor a 1', async () => {
      const created = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Test PDF' })

      const docId = created.body.document.id

      const res = await request(app)
        .patch(`/api/documents/${docId}/progress`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ currentPage: 0 })

      expect(res.status).toBe(400)
    })
  })

  describe('Sincronización por lote (Batch Sync)', () => {
    it('debe sincronizar libros locales de IndexedDB hacia MongoDB', async () => {
      const localBooks = [
        {
          id: 'book-local-1',
          title: 'Libro Local A',
          author: 'Autor Local',
          currentPage: 15,
          numPages: 150,
        },
        {
          id: 'book-local-2',
          title: 'Libro Local B',
          author: 'Autor Local 2',
          currentPage: 30,
          numPages: 60,
        },
      ]

      const res = await request(app)
        .post('/api/documents/sync')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ books: localBooks })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.documents.length).toBe(2)
      expect(res.body.documents[0].localId).toBe('book-local-1')
    })
  })
})
