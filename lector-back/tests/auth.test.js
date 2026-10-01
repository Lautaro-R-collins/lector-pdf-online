import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('Authentication API (/api/auth)', () => {
  const testUser = {
    name: 'Lautaro Collins',
    email: 'lautaro@example.com',
    password: 'password123',
  }

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario con éxito y devolver tokens', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user.name).toBe(testUser.name)
      expect(res.body.user.passwordHash).toBeUndefined()
      expect(res.body.accessToken).toBeDefined()

      // Debe incluir cookie HttpOnly con refreshToken
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies.some(c => c.includes('refreshToken='))).toBe(true)
    })

    it('debe fallar con 400 si el email es inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Lautaro',
          email: 'not-an-email',
          password: 'password123',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('debe fallar con 400 si la contraseña es muy corta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Lautaro',
          email: 'valid@example.com',
          password: '123',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('debe fallar con 409 si el correo ya está registrado', async () => {
      // First registration
      await request(app).post('/api/auth/register').send(testUser)

      // Duplicate registration
      const res = await request(app).post('/api/auth/register').send(testUser)

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('correo')
    })
  })

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión con credenciales correctas', async () => {
      await request(app).post('/api/auth/register').send(testUser)

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.user.email).toBe(testUser.email)
    })

    it('debe fallar con 401 si la contraseña es incorrecta', async () => {
      await request(app).post('/api/auth/register').send(testUser)

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('debe fallar con 401 si el usuario no existe', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'inexistente@example.com',
        password: 'password123',
      })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('debe fallar con 401 sin token de autenticación', async () => {
      const res = await request(app).get('/api/auth/me')

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('debe devolver la información del usuario autenticado', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser)
      const token = reg.body.accessToken

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user.name).toBe(testUser.name)
      expect(res.body.user.passwordHash).toBeUndefined()
    })
  })

  describe('POST /api/auth/refresh y POST /api/auth/logout', () => {
    it('debe renovar el accessToken usando el refreshToken en cookie', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser)
      const cookies = reg.headers['set-cookie']

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.accessToken).toBeDefined()
    })

    it('debe cerrar sesión y limpiar las cookies', async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser)
      const cookies = reg.headers['set-cookie']
      const token = reg.body.accessToken

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .set('Cookie', cookies)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
