import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

function App() {
  const [count, setCount] = useState(0)
  const [activeTab, setActiveTab] = useState('react')

  const techStack = [
    {
      id: 'react',
      name: 'React 19',
      category: 'UI Library',
      description: 'Librería para construir interfaces de usuario interactivas basadas en componentes.',
      badge: 'React',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
      icon: reactLogo,
    },
    {
      id: 'vite',
      name: 'Vite',
      category: 'Build Tool',
      description: 'Herramienta de desarrollo ultra rápida con HMR (Hot Module Replacement) instantáneo.',
      badge: 'Vite',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
      icon: viteLogo,
    },
    {
      id: 'jsx',
      name: 'JSX',
      category: 'Syntax Extension',
      description: 'Sintaxis declarativa que combina HTML y JavaScript de forma fluida y expresiva.',
      badge: 'JSX',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      icon: '⚛️',
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      category: 'Styling',
      description: 'Framework CSS utilitario para estilizar componentes directamente en el marcado con alta eficiencia.',
      badge: 'Tailwind v4',
      color: 'from-sky-500/20 to-teal-500/20 border-sky-500/30 text-sky-400',
      icon: '🎨',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 w-full">
        {/* Header Badge */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs font-medium text-cyan-400 shadow-xl shadow-cyan-950/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Proyecto Inicializado Correctamente
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            React + Vite + JSX + Tailwind
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-normal">
            Tu entorno de desarrollo rápido, moderno y altamente configurable está listo para construir.
          </p>

          {/* Action Buttons & Counter */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <span>Contador interactivo:</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-md font-mono text-sm group-hover:bg-white/30 transition-colors">
                {count}
              </span>
            </button>

            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-medium hover:text-white hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
            >
              Documentación Tailwind
            </a>
          </div>
        </header>

        {/* Tech Stack Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {techStack.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-6 rounded-2xl border bg-gradient-to-b backdrop-blur-xl transition-all duration-300 cursor-pointer ${
                activeTab === item.id
                  ? `${item.color} shadow-lg ring-1 ring-white/10 scale-[1.02]`
                  : 'from-slate-900/60 to-slate-900/30 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-2xl">
                  {typeof item.icon === 'string' && item.icon.startsWith('http') || item.icon.endsWith('.svg') ? (
                    <img src={item.icon} alt={item.name} className="h-6 w-6 object-contain" />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 font-mono text-slate-400">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">{item.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{item.category}</p>
              <p className="text-xs leading-relaxed text-slate-400">{item.description}</p>
            </div>
          ))}
        </section>

        {/* Code Snippet Box */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-400">src/App.jsx</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">React 19 + Tailwind v4</span>
          </div>

          <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
            <p className="text-purple-400">import <span className="text-slate-100">{'{ useState }'}</span> from <span className="text-emerald-400">'react'</span></p>
            <p className="text-purple-400">import <span className="text-emerald-400">'./index.css'</span></p>
            <br />
            <p className="text-purple-400">export default function <span className="text-yellow-300 font-semibold">App</span>() {'{'}</p>
            <p className="pl-4 text-slate-400">// ¡Empieza a construir tu aplicación aquí!</p>
            <p className="pl-4 text-purple-400">return (</p>
            <p className="pl-8 text-cyan-300">&lt;<span className="text-cyan-400">div</span> <span className="text-purple-300">className</span>=<span className="text-emerald-400">"min-h-screen bg-slate-950 text-white p-8"</span>&gt;</p>
            <p className="pl-12 text-cyan-300">&lt;<span className="text-cyan-400">h1</span> <span className="text-purple-300">className</span>=<span className="text-emerald-400">"text-3xl font-bold text-cyan-400"</span>&gt;</p>
            <p className="pl-16 text-slate-100">¡Hola Mundo desde React + Tailwind!</p>
            <p className="pl-12 text-cyan-300">&lt;/<span className="text-cyan-400">h1</span>&gt;</p>
            <p className="pl-8 text-cyan-300">&lt;/<span className="text-cyan-400">div</span>&gt;</p>
            <p className="pl-4 text-purple-400">)</p>
            <p>{'}'}</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>Inicializado con Vite • Estilizado con Tailwind CSS • Listo para Desarrollo</p>
      </footer>
    </div>
  )
}

export default App
