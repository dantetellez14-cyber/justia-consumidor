"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Download,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import type { CaseWithResponses } from "@/lib/supabase";
import {
  buildComplaintText,
  paramsFromCaseRecord,
  loadDraft,
  saveDraft,
} from "@/lib/complaint-document";

// ── Print CSS (injected once) ─────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  body > *:not(#print-root) { display: none !important; }
  #print-root { display: block !important; margin: 0; padding: 0; }
  .no-print { display: none !important; }
  .print-doc {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    background: #fff;
    padding: 2cm 2.5cm;
    white-space: pre-wrap;
  }
}
`;

function injectPrintStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById("editor-print-css")) return;
  const style = document.createElement("style");
  style.id = "editor-print-css";
  style.textContent = PRINT_CSS;
  document.head.appendChild(style);
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

function ToolBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // prevent contentEditable losing focus
        onClick();
      }}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-400 hover:text-white hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

// ── Editor content ─────────────────────────────────────────────────────────────

function EditorContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: caseData, error, isLoading } = useSWR<CaseWithResponses>(
    id ? `/api/cases?id=${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise editor content once case loads
  useEffect(() => {
    if (!caseData || !editorRef.current) return;

    // Prefer local draft
    const draft = id ? loadDraft(id) : null;
    if (draft) {
      editorRef.current.innerText = draft;
      return;
    }

    // Generate fresh document from case data
    const params = paramsFromCaseRecord(caseData);
    if (params) {
      editorRef.current.innerText = buildComplaintText(params);
    }
  }, [caseData, id]);

  // Inject print CSS once
  useEffect(() => {
    injectPrintStyle();
  }, []);

  // Exec formatting commands
  const execFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  // Save draft to localStorage
  const handleSave = useCallback(() => {
    if (!id || !editorRef.current) return;
    setSaveState("saving");
    saveDraft(id, editorRef.current.innerText);
    setTimeout(() => setSaveState("saved"), 400);
    setTimeout(() => setSaveState("idle"), 2400);
  }, [id]);

  // Auto-save 3s after user stops typing
  const handleInput = useCallback(() => {
    if (!id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (editorRef.current) saveDraft(id, editorRef.current.innerText);
    }, 3000);
  }, [id]);

  // Export to PDF via browser print dialog
  const handleExportPdf = useCallback(() => {
    const content = editorRef.current?.innerText ?? "";

    // Create a hidden print-ready container
    let root = document.getElementById("print-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "print-root";
      root.style.display = "none";
      document.body.appendChild(root);
    }
    root.innerHTML = `<div class="print-doc">${content.replace(/\n/g, "<br/>")}</div>`;

    window.print();
  }, []);

  // ── No ID ──────────────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">
          Caso no especificado
        </h2>
        <p className="text-slate-400 mb-6 max-w-sm">
          Accede al editor desde el flujo de análisis o desde el seguimiento de tu caso.
        </p>
        <Link
          href="/mis-casos"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ver mis casos
        </Link>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">
          Caso no encontrado
        </h2>
        <p className="text-slate-400 mb-6">
          No tienes permiso para ver este caso o fue eliminado.
        </p>
        <Link
          href="/mis-casos"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ver mis casos
        </Link>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || !caseData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const caseLabel = caseData.empresa
    ? `${caseData.empresa} · ${caseData.id.slice(0, 8).toUpperCase()}`
    : `Caso #${caseData.id.slice(0, 8).toUpperCase()}`;

  // ── Editor UI ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#1e293b] shrink-0 z-10 shadow-md no-print">
        <div className="flex items-center gap-4">
          <Link
            href={`/mis-casos/seguimiento?id=${id}`}
            className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {caseLabel}
          </Link>
          <div className="h-6 border-l border-slate-700 mx-2" />
          <div className="flex flex-col">
            <h2 className="text-white font-medium text-sm">
              Escrito Formal de Reclamo
            </h2>
            <span className="text-xs text-indigo-400">
              {saveState === "saving" && "Guardando…"}
              {saveState === "saved" && "✓ Borrador guardado"}
              {saveState === "idle" && "Editable — se guarda automáticamente"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saveState === "saved" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Save size={16} />
            )}
            {saveState === "saved" ? "Guardado" : "Guardar borrador"}
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </header>

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-slate-900 no-print">
        <div className="max-w-4xl mx-auto py-10 px-4">
          {/* Floating toolbar */}
          <div className="sticky top-4 z-20 flex justify-center mb-6 no-print">
            <div className="flex items-center gap-1 bg-[#1e293b] border border-slate-700 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl">
              <ToolBtn onClick={() => execFormat("bold")} title="Negrita">
                <Bold size={16} />
              </ToolBtn>
              <ToolBtn onClick={() => execFormat("italic")} title="Cursiva">
                <Italic size={16} />
              </ToolBtn>
              <ToolBtn onClick={() => execFormat("underline")} title="Subrayado">
                <Underline size={16} />
              </ToolBtn>
              <div className="w-px h-5 bg-slate-700 mx-2" />
              <ToolBtn onClick={() => execFormat("justifyLeft")} title="Alinear izquierda">
                <AlignLeft size={16} />
              </ToolBtn>
              <ToolBtn onClick={() => execFormat("justifyCenter")} title="Centrar">
                <AlignCenter size={16} />
              </ToolBtn>
              <ToolBtn onClick={() => execFormat("justifyRight")} title="Alinear derecha">
                <AlignRight size={16} />
              </ToolBtn>
              <div className="w-px h-5 bg-slate-700 mx-2" />
              <ToolBtn
                onClick={() => execFormat("insertUnorderedList")}
                title="Lista"
              >
                <List size={16} />
              </ToolBtn>
            </div>
          </div>

          {/* Paper */}
          <div className="relative w-full bg-[#f8fafc] text-slate-900 rounded-lg shadow-2xl shadow-black/40 min-h-[1000px] border border-slate-300 overflow-hidden">
            {/* Draft watermark */}
            {!caseData.complaint_generated && (
              <div className="absolute top-8 -right-10 bg-amber-500 text-white font-bold text-[10px] py-1 px-10 shadow-lg transform rotate-45 uppercase tracking-widest no-print">
                BORRADOR
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              spellCheck={false}
              className="p-16 md:p-24 outline-none selection:bg-indigo-200 font-serif text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap min-h-[900px]"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-500 mt-6 mb-20 no-print">
            El documento se guarda automáticamente en tu navegador cada 3 segundos.
            Para guardar permanentemente, usa "Guardar borrador".
            El PDF se genera con la impresora de tu sistema operativo.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentEditorPage() {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between shrink-0 no-print">
        <Link
          href="/"
          className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
          <Scale size={20} />
        </Link>
        <nav className="flex flex-col gap-8">
          <Link
            href="/mis-casos"
            className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Mis casos"
          >
            <ArrowLeft size={22} />
          </Link>
          <div className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <FileText size={22} />
          </div>
        </nav>
        <div />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center flex-1">
              <Loader2 size={32} className="text-indigo-400 animate-spin" />
            </div>
          }
        >
          <EditorContent />
        </Suspense>
      </div>
    </div>
  );
}
