"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-slate-300 px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30">
        {/* Wifi-off icon inline */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">Sin conexión</h1>
      <p className="mb-1 text-slate-400 max-w-sm">
        No podemos conectar con JustIA Consumidor en este momento.
      </p>
      <p className="mb-8 text-sm text-slate-600">
        Verificá tu conexión a internet e intentá nuevamente.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-500"
      >
        Reintentar
      </button>

      <p className="mt-8 text-xs text-slate-700">
        Tus casos guardados están disponibles cuando recuperes la conexión.
      </p>
    </div>
  );
}
