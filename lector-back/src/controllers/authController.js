import { AuthService } from '../services/authService.js'
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/tokenUtils.js'
import { sendCreated, sendSuccess } from '../utils/apiResponse.js'

export class AuthController {
  static async register(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body)

      setRefreshTokenCookie(res, refreshToken)

      return sendCreated(
        res,
        { user, accessToken },
        'Usuario registrado exitosamente'
      )
    } catch (error) {
      next(error)
    }
  }

  static async login(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body)

      setRefreshTokenCookie(res, refreshToken)

      return sendSuccess(
        res,
        { user, accessToken },
        'Inicio de sesión exitoso'
      )
    } catch (error) {
      next(error)
    }
  }

  static async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken
      const { accessToken, refreshToken } = await AuthService.refresh(token)

      setRefreshTokenCookie(res, refreshToken)

      return sendSuccess(
        res,
        { accessToken },
        'Token renovado exitosamente'
      )
    } catch (error) {
      next(error)
    }
  }

  static async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken
      const userId = req.user?._id

      await AuthService.logout(userId, token)
      clearRefreshTokenCookie(res)

      return sendSuccess(res, {}, 'Sesión cerrada correctamente')
    } catch (error) {
      next(error)
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user._id)
      return sendSuccess(res, { user }, 'Usuario obtenido')
    } catch (error) {
      next(error)
    }
  }
}
