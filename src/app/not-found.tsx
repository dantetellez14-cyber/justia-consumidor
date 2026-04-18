import Link from "next/link";
import { Scale, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-4">
            <Scale className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* 404 */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Error 404
        </p>
        <h1 className="mb-4 text-4xl font-bold text-slate-800">
          Página no encontrada
        </h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500">
          La página que buscás no existe o fue movida. Si creés que esto es un
          error, podés volver al inicio y continuar con tu reclamo.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>

        {/* Help links */}
        <div className="mt-10 flex justify-center gap-6 text-sm text-slate-400">
          <Link href="/mis-casos" className="hover:text-slate-600 transition-colors">
            Mis casos
          </Link>
          <Link href="/privacidad" className="hover:text-slate-600 transition-colors">
            Privacidad
          </Link>
          <Link href="/terminos" className="hover:text-slate-600 transition-colors">
            Términos
          </Link>
        </div>
      </div>
    </div>
  );
}
