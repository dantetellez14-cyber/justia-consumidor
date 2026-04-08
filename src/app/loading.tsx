import { Scale } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Cargando...</p>
      </div>
    </div>
  );
}
