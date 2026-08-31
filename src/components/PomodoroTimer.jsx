import { useEffect, useMemo, useState } from 'react'
import {
  POMODORO_MODES,
  clampMinutes,
  toSeconds,
  formatTime,
  playSoftChime,
} from '../utils/pomodoroUtils'

export default function PomodoroTimer({ btnBase }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [mode, setMode] = useState('focus')
  const [durations, setDurations] = useState({ focus: 25, shortBreak: 5, longBreak: 15 })
  const [secondsLeft, setSecondsLeft] = useState(toSeconds(durations.focus))
  const [running, setRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [focusSessions, setFocusSessions] = useState(0)
  const [notice, setNotice] = useState('')

  const totalSeconds = useMemo(() => toSeconds(durations[mode]), [durations, mode])
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0
  const modeStyle = POMODORO_MODES[mode]

  useEffect(() => {
    if (!running) return undefined

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1

        if (soundEnabled) playSoftChime()

        if (mode === 'focus') {
          const nextFocusSessions = focusSessions + 1
          const nextMode = nextFocusSessions % 4 === 0 ? 'longBreak' : 'shortBreak'
          setFocusSessions(nextFocusSessions)
          setMode(nextMode)
          setRunning(false)
          setNotice(`Tiempo de foco terminado. Sigue ${POMODORO_MODES[nextMode].label.toLowerCase()}.`)
          return toSeconds(durations[nextMode])
        }

        setMode('focus')
        setRunning(false)
        setNotice('Descanso terminado. Listo para otra sesión de foco.')
        return toSeconds(durations.focus)
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [durations, focusSessions, mode, running, soundEnabled])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const updateDuration = (key, value) => {
    const nextValue = clampMinutes(value)
    setDurations((current) => ({ ...current, [key]: nextValue }))
    if (!running && key === mode) setSecondsLeft(toSeconds(nextValue))
  }

  const resetTimer = () => {
    setRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setRunning(false)
    setSecondsLeft(toSeconds(durations[nextMode]))
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPanelOpen(open => !open)}
        className={`${btnBase} h-8 min-w-18 gap-1.5 px-2 ${running || panelOpen ? 'text-emerald-300 bg-emerald-500/10' : ''}`}
        title="Pomodoro"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.25 2M9.75 3.75h4.5M5.25 2.25l-1.5 1.5m16.5 0-1.5-1.5M20.25 12a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" />
        </svg>
        <span className="text-xs tabular-nums">{formatTime(secondsLeft)}</span>
      </button>

      {panelOpen && (
        <div className="absolute right-0 top-10 z-40 w-72 rounded-lg border border-white/10 bg-[#16161f] p-3 shadow-2xl shadow-black/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs font-semibold ${modeStyle.color}`}>{modeStyle.label}</p>
              <p className="text-4xl font-semibold tabular-nums text-slate-100">{formatTime(secondsLeft)}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${modeStyle.bg} flex items-center justify-center`}>
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-white/10" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  className="stroke-current text-emerald-400"
                  strokeWidth="3"
                  strokeDasharray={`${Math.max(0, progress) * 94.25} 94.25`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1">
            {Object.entries(POMODORO_MODES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectMode(key)}
                className={`rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${mode === key ? 'bg-white/10 text-slate-100' : 'text-slate-500 hover:text-slate-200'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning(value => !value)}
              className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600/80 px-3 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {running ? (
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
              {running ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className={`${btnBase} h-8 w-8`}
              title="Reiniciar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M20.49 9A8.25 8.25 0 105.64 15.77" />
              </svg>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="text-[11px] text-slate-500">
              Foco
              <input
                type="number"
                min="1"
                max="180"
                value={durations.focus}
                onChange={(event) => updateDuration('focus', event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 focus:border-indigo-500/60 focus:outline-none"
              />
            </label>
            <label className="text-[11px] text-slate-500">
              Corto
              <input
                type="number"
                min="1"
                max="180"
                value={durations.shortBreak}
                onChange={(event) => updateDuration('shortBreak', event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 focus:border-indigo-500/60 focus:outline-none"
              />
            </label>
            <label className="text-[11px] text-slate-500">
              Largo
              <input
                type="number"
                min="1"
                max="180"
                value={durations.longBreak}
                onChange={(event) => updateDuration('longBreak', event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 focus:border-indigo-500/60 focus:outline-none"
              />
            </label>
          </div>

          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
            <span>Sonido al terminar</span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
              className="h-4 w-4 cursor-pointer accent-indigo-500"
            />
          </label>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sesiones de foco</span>
            <span className="tabular-nums">{focusSessions}</span>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-4 right-4 z-50 max-w-72 rounded-lg border border-emerald-400/20 bg-[#16161f] px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-black/40">
          {notice}
        </div>
      )}
    </div>
  )
}
