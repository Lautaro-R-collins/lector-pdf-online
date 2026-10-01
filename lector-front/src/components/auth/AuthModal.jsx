import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    syncStatus,
    lastSyncTime,
    syncNow,
    authError,
    setAuthError,
  } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    let res
    if (mode === 'login') {
      res = await login(email, password)
    } else {
      res = await register(name, email, password)
    }

    setSubmitting(false)
    if (res.success) {
      onClose()
    }
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#13131e] border border-white/10 p-6 shadow-2xl shadow-indigo-950/50">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {isAuthenticated ? (
          /* Profile & Cloud Sync View */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{user?.name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            {/* Sync Status Box */}
            <div className="rounded-xl bg-[#1a1a28] border border-white/5 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Estado en la Nube
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : syncStatus === 'error'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-400'
                        : syncStatus === 'syncing'
                        ? 'bg-amber-400 animate-pulse'
                        : syncStatus === 'error'
                        ? 'bg-rose-400'
                        : 'bg-indigo-400'
                    }`}
                  />
                  {syncStatus === 'synced'
                    ? 'Sincronizado'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : syncStatus === 'error'
                    ? 'Error de conexión'
                    : 'Listo'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Tu biblioteca y progreso están sincronizados con tu cuenta. La persistencia local en tu navegador continúa activa.
              </p>

              {lastSyncTime && (
                <p className="text-[11px] text-slate-500 mb-3">
                  Última sincronización: {new Date(lastSyncTime).toLocaleTimeString()}
                </p>
              )}

              <button
                type="button"
                onClick={syncNow}
                disabled={syncStatus === 'syncing'}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                <span>☁️</span> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setAuthError(null)
                }}
                className={`pb-2.5 px-3 text-sm font-semibold transition-all cursor-pointer relative ${
                  mode === 'login'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setAuthError(null)
                }}
                className={`pb-2.5 px-3 text-sm font-semibold transition-all cursor-pointer relative ${
                  mode === 'register'
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {mode === 'login'
                ? 'Accede para sincronizar tu biblioteca y continuar tu lectura en cualquier dispositivo.'
                : 'Crea tu cuenta para respaldar tus libros, progreso y notas en la nube.'}
            </p>

            {authError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tu nombre o apodo"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting
                  ? 'Procesando...'
                  : mode === 'login'
                  ? 'Iniciar Sesión'
                  : 'Registrarse e Iniciar'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <span className="text-[11px] text-slate-500">
                🔒 El modo local sigue funcionando 100% offline sin cuenta.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
