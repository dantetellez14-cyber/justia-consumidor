"use client";

import { useState, useMemo, useCallback } from "react";
import { CaseAnalysis } from "@/lib/types";
import {
  Landmark,
  ChevronRight,
  ChevronDown,
  Download,
  Save,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  FileText,
  ClipboardList,
  Shield,
  ArrowRight,
  Info,
  Star,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getChannelsForCountry,
  getRecommendedChannel,
  getFilingInstructions,
  generateEscalationDocument,
  prefillFromAnalysis,
  type EscalationChannel,
  type EscalationChannelInfo,
  type EscalationFormData,
} from "@/lib/escalation";

interface Props {
  readonly analysis: CaseAnalysis;
  readonly nombre?: string;
  readonly email?: string;
  readonly caseId: string | null;
  readonly onNext: () => void;
}

// ── Step indicator ──

type WizardStep = "select" | "form" | "document" | "instructions";

const STEP_LABELS: Record<WizardStep, string> = {
  select: "Canal",
  form: "Datos",
  document: "Documento",
  instructions: "Pasos",
};

function StepIndicator({
  current,
  steps,
}: {
  readonly current: WizardStep;
  readonly steps: ReadonlyArray<WizardStep>;
}) {
  const currentIdx = steps.indexOf(current);
  return (
    <div className="mb-6 flex items-center justify-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i < currentIdx
                ? "bg-emerald-100 text-emerald-700"
                : i === currentIdx
                  ? "bg-blue-500 text-white ring-4 ring-blue-100"
                  : "bg-slate-100 text-slate-400"
            }`}
          >
            {i < currentIdx ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              i + 1
            )}
          </div>
          <span
            className={`hidden text-xs sm:inline ${
              i === currentIdx
                ? "font-semibold text-slate-700"
                : "text-slate-400"
            }`}
          >
            {STEP_LABELS[s]}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="h-3 w-3 text-slate-300" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Channel card ──

function ChannelCard({
  channel,
  isRecommended,
  isSelected,
  onSelect,
}: {
  readonly channel: EscalationChannelInfo;
  readonly isRecommended: boolean;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
        isSelected
          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Landmark
            className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`}
          />
          <span className="text-sm font-semibold text-slate-800">
            {channel.nombre}
          </span>
        </div>
        {isRecommended && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <Star className="h-2.5 w-2.5" />
            Recomendado
          </span>
        )}
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        {channel.descripcion}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {channel.tipo === "conciliacion"
            ? "Conciliacion"
            : channel.tipo === "queja"
              ? "Queja formal"
              : "Denuncia"}
        </span>
        <span>
          {channel.plazoEstimado}
        </span>
        {channel.obligatorio && (
          <span className="rounded bg-red-50 px-1.5 py-0.5 font-semibold text-red-600">
            Obligatorio pre-judicial
          </span>
        )}
      </div>
    </button>
  );
}

// ── Form field helper ──

function Field({
  label,
  required,
  children,
}: {
  readonly label: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder: string;
  readonly type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  );
}

// ── Main Component ──

export function EscalationModule({
  analysis,
  nombre: initialNombre,
  email: initialEmail,
  caseId,
  onNext,
}: Props) {
  const [wizardStep, setWizardStep] = useState<WizardStep>("select");
  const [selectedChannel, setSelectedChannel] =
    useState<EscalationChannel | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const prefilled = useMemo(
    () => prefillFromAnalysis(analysis, initialNombre ?? "", initialEmail ?? ""),
    [analysis, initialNombre, initialEmail]
  );

  const [nombreCompleto, setNombreCompleto] = useState(
    prefilled.nombreCompleto ?? ""
  );
  const [documento, setDocumento] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [email, setEmail] = useState(prefilled.email ?? "");
  const [telefono, setTelefono] = useState("");
  const [empresaDomicilio, setEmpresaDomicilio] = useState("");
  const [empresaId, setEmpresaId] = useState(""); // RFC or CUIT
  const [resolucion, setResolucion] = useState("");
  const [fechaReclamoDirecto, setFechaReclamoDirecto] = useState("");
  const [numeroReclamo, setNumeroReclamo] = useState("");
  const [expandedRequisitos, setExpandedRequisitos] = useState(false);

  const loadFormExample = () => {
    const isMX = analysis.pais_detectado === "MX";
    setNombreCompleto("Dante Tellez");
    setDocumento(isMX ? "TELD900101HDFLLB03" : "37654321");
    setEmail("dantetellezao@gmail.com");
    setTelefono(isMX ? "+52 55 8888 9999" : "+54 11 5555 7777");
    setDomicilio(
      isMX
        ? "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, CP 03100"
        : "Av. Corrientes 1234, Piso 3, CABA, CP 1043"
    );
    setEmpresaDomicilio(
      isMX
        ? "Insurgentes Sur 3579, CDMX"
        : "Viamonte 401, CABA"
    );
    setEmpresaId(isMX ? "MLA820518B34" : "30-66666670-9");
    setResolucion(
      "Devolución íntegra del importe abonado más compensación por daños y perjuicios ocasionados por la negativa infundada de la empresa."
    );
    setFechaReclamoDirecto("05/04/2026");
    setNumeroReclamo("REC-2026-88421");
  };

  const channels = useMemo(
    () => getChannelsForCountry(analysis.pais_detectado),
    [analysis.pais_detectado]
  );

  const recommended = useMemo(
    () => getRecommendedChannel(analysis.pais_detectado, analysis),
    [analysis]
  );

  const selectedInfo = useMemo(
    () => channels.find((ch) => ch.id === selectedChannel),
    [channels, selectedChannel]
  );

  const wizardSteps: WizardStep[] = [
    "select",
    "form",
    "document",
    "instructions",
  ];

  const isMX = analysis.pais_detectado === "MX";
  const docLabel = isMX ? "CURP" : "DNI";
  const idLabel = isMX ? "RFC de la empresa" : "CUIT de la empresa";

  const canProceedForm =
    nombreCompleto.trim() && documento.trim() && email.trim();

  // Snapshot of formData captured at the moment the user clicks "Generar documento".
  // Avoids including the inline formData object (new reference every render) as a
  // useMemo dependency, which would re-run the generator on every keystroke.
  const [formDataSnapshot, setFormDataSnapshot] =
    useState<EscalationFormData | null>(null);

  const advanceToDocument = useCallback(() => {
    setFormDataSnapshot({
      nombreCompleto,
      documento,
      domicilio,
      email,
      telefono,
      empresaNombre: analysis.empresa,
      empresaDomicilio,
      ...(isMX ? { empresaRFC: empresaId } : { empresaCUIT: empresaId }),
      descripcionHechos: analysis.core_grievance,
      montoReclamado: analysis.monto_reclamo,
      fechaCompra: analysis.fecha_incidente,
      productoServicio: analysis.producto_servicio,
      resolucionSolicitada: resolucion,
      reclamoDirectoRealizado: true,
      fechaReclamoDirecto: fechaReclamoDirecto || undefined,
      numeroReclamoDirecto: numeroReclamo || undefined,
    });
    setWizardStep("document");
  }, [
    nombreCompleto,
    documento,
    domicilio,
    email,
    telefono,
    analysis,
    empresaDomicilio,
    isMX,
    empresaId,
    resolucion,
    fechaReclamoDirecto,
    numeroReclamo,
  ]);

  const generatedDoc = useMemo(() => {
    if (!selectedChannel || !formDataSnapshot) return null;
    return generateEscalationDocument(selectedChannel, formDataSnapshot, analysis);
  }, [selectedChannel, formDataSnapshot, analysis]);

  const instructions = useMemo(() => {
    if (!selectedChannel) return [];
    return getFilingInstructions(selectedChannel);
  }, [selectedChannel]);

  const handleDownload = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc.contenido], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedDoc.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.contenido);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save escalation to case (fire-and-forget)
  const saveEscalation = () => {
    if (!caseId || !selectedChannel) return;
    fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        escalation_channel: selectedChannel,
        escalation_date: new Date().toISOString(),
        status: "escalado",
      }),
    }).catch(() => {
      // Non-blocking
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2">
            <Landmark className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Escalar a Organismo Oficial
            </h3>
            <p className="text-sm text-slate-500">
              {isMX
                ? "Presenta tu queja ante PROFECO o Concilianet"
                : "Inicia conciliacion en COPREC o Defensa del Consumidor"}
            </p>
          </div>
        </div>

        <StepIndicator current={wizardStep} steps={wizardSteps} />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Select channel ── */}
          {wizardStep === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Explanation banner */}
              <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs leading-relaxed text-blue-700">
                  {isMX
                    ? "PROFECO es el organismo federal que protege a los consumidores en Mexico. Puedes presentar tu queja en linea y un conciliador mediara con la empresa sin costo."
                    : "COPREC es la instancia de conciliacion OBLIGATORIA antes de ir a juicio en Argentina (Ley 26.993). Un conciliador certificado mediara en una audiencia virtual gratuita."}
                </p>
              </div>

              {channels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  isRecommended={ch.id === recommended}
                  isSelected={selectedChannel === ch.id}
                  onSelect={() => setSelectedChannel(ch.id)}
                />
              ))}

              {/* Requirements expandable */}
              {selectedInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedRequisitos(!expandedRequisitos)}
                    className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Requisitos y documentos necesarios
                    {expandedRequisitos ? (
                      <ChevronDown className="ml-auto h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="ml-auto h-3.5 w-3.5" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedRequisitos && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 rounded-lg border border-slate-100 bg-white p-4"
                      >
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          Requisitos:
                        </p>
                        <ul className="mb-3 space-y-1">
                          {selectedInfo.requisitos.map((r) => (
                            <li
                              key={r}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                              {r}
                            </li>
                          ))}
                        </ul>
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          Documentos a preparar:
                        </p>
                        <ul className="space-y-1">
                          {selectedInfo.documentos.map((d) => (
                            <li
                              key={d}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <FileText className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <button
                onClick={() => setWizardStep("form")}
                disabled={!selectedChannel}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Fill form ── */}
          {wizardStep === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Completa tus datos personales. Estos se usaran para generar el
                  documento de presentacion ante{" "}
                  <strong>{selectedInfo?.nombre}</strong>.
                </p>
                <button
                  type="button"
                  onClick={loadFormExample}
                  className="ml-3 flex shrink-0 items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Cargar ejemplo
                </button>
              </div>

              {/* Consumer data */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tus datos
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Nombre completo" required>
                    <Input
                      value={nombreCompleto}
                      onChange={setNombreCompleto}
                      placeholder="Juan Perez"
                    />
                  </Field>
                  <Field label={docLabel} required>
                    <Input
                      value={documento}
                      onChange={setDocumento}
                      placeholder={isMX ? "XXXX000000XXXXXX00" : "12345678"}
                    />
                  </Field>
                  <Field label="Email" required>
                    <Input
                      value={email}
                      onChange={setEmail}
                      placeholder="juan@email.com"
                      type="email"
                    />
                  </Field>
                  <Field label="Telefono">
                    <Input
                      value={telefono}
                      onChange={setTelefono}
                      placeholder={isMX ? "+52 55 1234 5678" : "+54 11 1234 5678"}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Domicilio">
                      <Input
                        value={domicilio}
                        onChange={setDomicilio}
                        placeholder="Calle, numero, colonia/barrio, ciudad, CP"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Provider data */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Datos de la empresa
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Empresa">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                      {analysis.empresa}
                    </div>
                  </Field>
                  <Field label={idLabel}>
                    <Input
                      value={empresaId}
                      onChange={setEmpresaId}
                      placeholder={
                        isMX
                          ? "XXX000000XXX"
                          : "30-12345678-9"
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Domicilio de la empresa">
                      <Input
                        value={empresaDomicilio}
                        onChange={setEmpresaDomicilio}
                        placeholder="Direccion de la sucursal o sede principal"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Resolution and prior complaint */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Detalles adicionales
                </p>
                <div className="space-y-3">
                  <Field label="Resolucion que solicitas">
                    <textarea
                      value={resolucion}
                      onChange={(e) => setResolucion(e.target.value)}
                      placeholder="Ej: Devolucion integra del importe abonado y compensacion por danos"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Fecha del reclamo a la empresa">
                      <Input
                        value={fechaReclamoDirecto}
                        onChange={setFechaReclamoDirecto}
                        placeholder="dd/mm/aaaa"
                      />
                    </Field>
                    <Field label="Numero de reclamo (si tenes)">
                      <Input
                        value={numeroReclamo}
                        onChange={setNumeroReclamo}
                        placeholder="Ej: REC-2026-12345"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setWizardStep("select")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Atras
                </button>
                <button
                  onClick={advanceToDocument}
                  disabled={!canProceedForm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
                >
                  Generar documento
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Document preview ── */}
          {wizardStep === "document" && generatedDoc && (
            <motion.div
              key="document"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-xs text-emerald-700">
                  Documento generado para <strong>{selectedInfo?.nombre}</strong>
                  . Revisalo, descargalo y usalo al presentar tu queja en el
                  portal oficial.
                </p>
              </div>

              {/* Document preview */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">
                    {generatedDoc.titulo}
                  </span>
                </div>
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-600">
                  {generatedDoc.contenido}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Descargar documento
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Save className="h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar texto"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setWizardStep("form")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Atras
                </button>
                <button
                  onClick={() => {
                    saveEscalation();
                    setWizardStep("instructions");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  Ver pasos para presentar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Filing instructions ── */}
          {wizardStep === "instructions" && selectedInfo && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="mb-3 text-sm font-semibold text-blue-800">
                  Como presentar tu queja en {selectedInfo.nombre}
                </p>
                <ol className="space-y-2.5">
                  {instructions.map((instruction, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-xs text-blue-700"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-800">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{instruction}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>

              {/* Direct link to portal */}
              <a
                href={selectedInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-amber-300 bg-amber-50 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                <ExternalLink className="h-4 w-4" />
                Ir a {selectedInfo.nombre}
              </a>

              {/* Important reminders */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-semibold text-amber-700">
                    Recordatorios importantes
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    Guarda una copia de todo lo que presentes (capturas, acuse de
                    recibo)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    Anota el numero de folio/expediente que te asignen
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    {isMX
                      ? "La audiencia de conciliacion puede ser presencial o virtual"
                      : "La audiencia COPREC generalmente es virtual (video llamada)"}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    {isMX
                      ? "Si la empresa no esta en Concilianet, usa Queja en Linea"
                      : "Si no hay acuerdo en COPREC, podes ir a la Auditoria de Relaciones de Consumo"}
                  </li>
                </ul>
              </div>

              <button
                onClick={onNext}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
              >
                Continuar al seguimiento
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
