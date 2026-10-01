import { User } from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenUtils.js'

export class AuthService {
  static async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      throw ApiError.conflict('Ya existe una cuenta registrada con este correo electrónico')
    }

    const passwordHash = await User.hashPassword(password)

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    })

    const accessToken = generateAccessToken({ id: user._id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user._id })

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    user.refreshTokens.push({ token: refreshToken, expiresAt })
    await user.save()

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }
  }

  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +refreshTokens')
    if (!user) {
      throw ApiError.unauthorized('Credenciales inválidas')
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw ApiError.unauthorized('Credenciales inválidas')
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user._id })

    // Clean up expired refresh tokens and add new one (rotation)
    const now = new Date()
    user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > now)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    user.refreshTokens.push({ token: refreshToken, expiresAt })
    await user.save()

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }
  }

  static async refresh(token) {
    if (!token) {
      throw ApiError.unauthorized('Token de actualización no proporcionado')
    }

    let decoded
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      throw ApiError.unauthorized('Token de actualización inválido o expirado')
    }

    const user = await User.findById(decoded.id).select('+refreshTokens')
    if (!user) {
      throw ApiError.unauthorized('Usuario no encontrado')
    }

    const tokenDoc = user.refreshTokens.find(rt => rt.token === token)
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      // Possible reuse detected or expired, revoke token
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token)
      await user.save()
      throw ApiError.unauthorized('Token de actualización no válido o revocado')
    }

    // Token Rotation: Remove old refresh token and create a new pair
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token)

    const newAccessToken = generateAccessToken({ id: user._id, email: user.email })
    const newRefreshToken = generateRefreshToken({ id: user._id })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    user.refreshTokens.push({ token: newRefreshToken, expiresAt })
    await user.save()

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  static async logout(userId, token) {
    if (!userId) return

    const user = await User.findById(userId).select('+refreshTokens')
    if (!user) return

    if (token) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token)
    } else {
      user.refreshTokens = []
    }

    await user.save()
  }

  static async getCurrentUser(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw ApiError.notFound('Usuario no encontrado')
    }
    return user.toJSON()
  }
}
