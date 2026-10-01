const PRIORITY_BADGES = {
  Alta: { label: 'Alta', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  Media: { label: 'Media', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  Baja: { label: 'Baja', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
}

export default function BookCard({ book, onOpen, onEdit, onDelete }) {
  const priorityStyle = PRIORITY_BADGES[book.priority] || PRIORITY_BADGES.Media
  const progressPercent = book.numPages > 0 ? Math.round((book.currentPage / book.numPages) * 100) : 0

  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#13131c] border border-white/10 overflow-hidden shadow-xl hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">

      {/* Book Cover Visual Box */}
      <div
        onClick={() => onOpen(book)}
        className={`relative h-56 w-full cursor-pointer bg-gradient-to-br ${book.coverColor || 'from-indigo-600 to-slate-900'} p-5 flex flex-col justify-between overflow-hidden select-none transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        {/* Spine shadow overlay effect */}
        <div className="absolute inset-y-0 left-0 w-3 bg-black/20 backdrop-blur-[1px] border-r border-white/10" />

        {/* Decorative background element */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Priority & Genre Badges */}
        <div className="flex items-center justify-between gap-2 z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${priorityStyle.bg}`}>
            {priorityStyle.label}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/40 text-slate-200 border border-white/10 backdrop-blur-md">
            {book.genre}
          </span>
        </div>

        {/* Book Title & Author on Cover */}
        <div className="z-10 mt-auto">
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
            {book.title}
          </h3>
          <p className="text-xs text-white/80 mt-1 font-medium truncate">
            {book.author}
          </p>
        </div>

        {/* Rating Stars Overlay */}
        {book.rating > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-0.5 text-amber-300 text-xs font-bold z-10">
            ★ {book.rating}
          </div>
        )}
      </div>

      {/* Book Details Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-[#13131c]">
        {/* Reading Progress */}
        {book.numPages > 0 ? (
          <div className="mb-3">
            <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
              <span>Progreso</span>
              <span className="font-semibold text-slate-200">{progressPercent}% ({book.currentPage}/{book.numPages})</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mb-3 italic">Sin abrir todavía</p>
        )}

        {/* Actions Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => onOpen(book)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
            Leer
          </button>

          <button
            type="button"
            onClick={() => onEdit(book)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Editar libro"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(book.id)}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Eliminar libro"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
