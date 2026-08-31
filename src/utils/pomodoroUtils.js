export const POMODORO_MODES = {
  focus: { label: 'Foco', nextLabel: 'Descanso', color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
  shortBreak: { label: 'Descanso', nextLabel: 'Foco', color: 'text-sky-300', bg: 'bg-sky-500/10' },
  longBreak: { label: 'Descanso largo', nextLabel: 'Foco', color: 'text-violet-300', bg: 'bg-violet-500/10' },
}

export function clampMinutes(value) {
  return Math.min(180, Math.max(1, Number(value) || 1))
}

export function toSeconds(minutes) {
  return clampMinutes(minutes) * 60
}

export function formatTime(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/**
 * Plays a pleasant completion chime using Web Audio API and safely disposes of the AudioContext.
 */
export function playSoftChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  try {
    const audioContext = new AudioContextClass()
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    const gain = audioContext.createGain()
    const now = audioContext.currentTime
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
    gain.connect(audioContext.destination)

    ;[660, 880].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.12)
      oscillator.connect(gain)
      oscillator.start(now + index * 0.12)
      oscillator.stop(now + 0.65 + index * 0.12)
    })

    // Automatically close AudioContext to free hardware resources
    setTimeout(() => {
      audioContext.close().catch(() => {})
    }, 1000)
  } catch (err) {
    console.error('Audio chime error:', err)
  }
}
