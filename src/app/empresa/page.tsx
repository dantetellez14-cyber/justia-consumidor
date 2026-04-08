"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserButton, SignInButton } from "@clerk/nextjs";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Scale,
  AlertCircle,
  BarChart3,
  Clock,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  FileText,
  Send,
  ArrowLeft,
  ChevronRight,
  Inbox,
  XCircle,
  HandshakeIcon,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type {
  CompanyAccount,
  CompanyDashboardStats,
  CompanyCaseView,
  CompanyResponse,
} from "@/lib/empresa";

// ── Types for API response ──

interface CompanySuggestionExisting {
  type: "existing_account";
  account: CompanyAccount;
  email: string;
}

interface CompanySuggestionCases {
  type: "has_complaints";
  empresaName: string;
  complaintCount: number;
  email: string;
}

type CompanySuggestionData = CompanySuggestionExisting | CompanySuggestionCases;

interface EmpresaData {
  registered: boolean;
  account?: CompanyAccount;
  role?: "admin" | "operador" | "lectura";
  stats?: CompanyDashboardStats;
  complaints?: ReadonlyArray<CompanyCaseView>;
  suggestion?: CompanySuggestionData;
}

type DashboardView = "overview" | "detail" | "register" | "suggestion";

// ── Status badges ──

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  consulta_recibida: { label: "Nuevo", color: "bg-blue-100 text-blue-700" },
  reclamo_generado: { label: "Reclamo formal", color: "bg-amber-100 text-amber-700" },
  enviado_empresa: { label: "Pendiente respuesta", color: "bg-red-100 text-red-700" },
  en_mediacion: { label: "En mediacion", color: "bg-purple-100 text-purple-700" },
  escalado: { label: "Escalado", color: "bg-orange-100 text-orange-700" },
  resuelto: { label: "Resuelto", color: "bg-emerald-100 text-emerald-700" },
};

const RESPONSE_TYPES = [
  { value: "aceptar" as const, label: "Aceptar reclamo", icon: CheckCircle2, color: "text-emerald-600" },
  { value: "propuesta" as const, label: "Hacer propuesta", icon: HandshakeIcon, color: "text-blue-600" },
  { value: "solicitar_info" as const, label: "Solicitar informacion", icon: HelpCircle, color: "text-amber-600" },
  { value: "rechazar" as const, label: "Rechazar", icon: XCircle, color: "text-red-600" },
];

// ── Registration Form ──

function RegistrationForm({
  prefillName,
  onRegistered,
}: {
  readonly prefillName?: string;
  readonly onRegistered: () => void;
}) {
  const [nombre, setNombre] = useState(prefillName ?? "");
  const [pais, setPais] = useState<"AR" | "MX">("AR");
  const [sector, setSector] = useState("");
  const [taxId, setTaxId] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          pais,
          sector: sector || undefined,
          ...(pais === "MX" ? { rfc: taxId || undefined } : { cuit: taxId || undefined }),
          email_contacto: emailContacto || undefined,
          telefono: telefono || undefined,
          domicilio: domicilio || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Registrar empresa
            </h2>
            <p className="text-sm text-slate-500">
              Configura tu cuenta empresarial para gestionar reclamos
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Nombre de la empresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: MercadoLibre, Telmex, Personal"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Pais <span className="text-red-400">*</span>
              </label>
              <select
                value={pais}
                onChange={(e) => setPais(e.target.value as "AR" | "MX")}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="AR">Argentina</option>
                <option value="MX">Mexico</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {pais === "MX" ? "RFC" : "CUIT"}
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={pais === "MX" ? "XXX000000XXX" : "30-12345678-9"}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Sector / industria
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej: Telecomunicaciones, E-commerce, Servicios financieros"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Email de contacto
              </label>
              <input
                type="email"
                value={emailContacto}
                onChange={(e) => setEmailContacto(e.target.value)}
                placeholder="reclamos@empresa.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Telefono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 11 1234 5678"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Domicilio legal
            </label>
            <input
              type="text"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Av. Corrientes 1234, CABA"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nombre.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            {loading ? "Registrando..." : "Registrar empresa"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ── Auto-detection Suggestion ──

function CompanySuggestion({
  suggestion,
  onConfirm,
  onReject,
}: {
  readonly suggestion: CompanySuggestionData;
  readonly onConfirm: () => void;
  readonly onReject: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailDomain = suggestion.email.split("@")[1] ?? "";

  const handleClaim = async () => {
    if (suggestion.type !== "existing_account") {
      onReject(); // go to registration with pre-filled name
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: suggestion.account.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al vincular.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-md">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Empresa detectada
            </h2>
            <p className="text-xs text-slate-500">
              Tu email <strong>@{emailDomain}</strong> coincide con una empresa
            </p>
          </div>
        </div>

        {suggestion.type === "existing_account" ? (
          <div className="mb-5 rounded-lg border border-emerald-100 bg-white p-4">
            <p className="mb-1 text-xs font-medium uppercase text-emerald-600">
              Empresa registrada
            </p>
            <p className="text-xl font-bold text-slate-800">
              {suggestion.account.nombre}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              {suggestion.account.sector && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  {suggestion.account.sector}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {suggestion.account.pais === "MX" ? "Mexico" : "Argentina"}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Esta empresa ya tiene una cuenta activa en JustIA. Al confirmar,
              te vincularemos como miembro del equipo.
            </p>
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-amber-100 bg-white p-4">
            <p className="mb-1 text-xs font-medium uppercase text-amber-600">
              Reclamos encontrados
            </p>
            <p className="text-xl font-bold text-slate-800">
              {suggestion.empresaName}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Hay <strong>{suggestion.complaintCount}</strong>{" "}
              {suggestion.complaintCount === 1 ? "reclamo" : "reclamos"} de
              consumidores para esta empresa. Registrate para gestionarlos.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClaim}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {suggestion.type === "existing_account"
              ? "Si, soy de esta empresa"
              : "Registrar esta empresa"}
          </button>
          <button
            onClick={onReject}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            No es mi empresa
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Stats Cards ──

function StatsGrid({ stats }: { readonly stats: CompanyDashboardStats }) {
  const cards = [
    {
      label: "Total reclamos",
      value: stats.totalReclamos,
      icon: Inbox,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Respondidos",
      value: stats.respondidos,
      icon: MessageSquare,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Resueltos",
      value: stats.resueltos,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {card.label}
            </span>
            <div className={`rounded-lg p-1.5 ${card.color}`}>
              <card.icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Metrics bar ──

function MetricsBar({ stats }: { readonly stats: CompanyDashboardStats }) {
  const moneda = ""; // Generic since company may have both AR/MX cases
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <DollarSign className="h-3.5 w-3.5" />
          Monto total reclamado
        </div>
        <p className="text-lg font-bold text-slate-800">
          ${stats.montoTotalReclamado.toLocaleString()}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Monto promedio
        </div>
        <p className="text-lg font-bold text-slate-800">
          ${Math.round(stats.montoPromedioReclamado).toLocaleString()}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" />
          Tasa de respuesta
        </div>
        <p className="text-lg font-bold text-slate-800">
          {Math.round(stats.tasaRespuesta * 100)}%
        </p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              stats.tasaRespuesta >= 0.7
                ? "bg-emerald-400"
                : stats.tasaRespuesta >= 0.4
                  ? "bg-amber-400"
                  : "bg-red-400"
            }`}
            style={{ width: `${stats.tasaRespuesta * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Complaint list ──

function ComplaintList({
  complaints,
  onSelect,
}: {
  readonly complaints: ReadonlyArray<CompanyCaseView>;
  readonly onSelect: (c: CompanyCaseView) => void;
}) {
  if (complaints.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-16 text-center"
      >
        <Inbox className="mb-4 h-16 w-16 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-700">
          No hay reclamos registrados
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Cuando un consumidor presente un reclamo contra tu empresa, aparecera
          aqui para que puedas gestionarlo.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {complaints.map((c, i) => {
        const statusCfg = STATUS_DISPLAY[c.status] ?? STATUS_DISPLAY.consulta_recibida;
        const hasResponse = c.responses.length > 0;

        return (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(c)}
            className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                hasResponse ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              {hasResponse ? (
                <MessageSquare className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
                {c.pais_detectado && (
                  <span className="text-[10px] text-slate-400">
                    {c.pais_detectado === "MX" ? "Mexico" : "Argentina"}
                  </span>
                )}
              </div>
              <p className="truncate text-sm font-medium text-slate-800">
                {c.core_grievance ?? c.producto_servicio ?? "Reclamo sin detalle"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {new Date(c.created_at).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {c.monto_reclamo != null && ` · $${c.monto_reclamo.toLocaleString()}`}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Complaint detail + response form ──

function ComplaintDetail({
  complaint,
  companyId,
  onBack,
  onResponded,
}: {
  readonly complaint: CompanyCaseView;
  readonly companyId: string;
  readonly onBack: () => void;
  readonly onResponded: () => void;
}) {
  const [selectedType, setSelectedType] =
    useState<CompanyResponse["tipo_respuesta"] | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [propuestaMonto, setPropuestaMonto] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const moneda = complaint.pais_detectado === "MX" ? "MXN" : "ARS";

  const handleSendResponse = async () => {
    if (!selectedType || !mensaje.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/empresa/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: complaint.id,
          tipo_respuesta: selectedType,
          mensaje,
          propuesta_monto: propuestaMonto
            ? parseFloat(propuestaMonto)
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(onResponded, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al responder.");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a reclamos
      </button>

      {/* Complaint summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            Detalle del reclamo
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              (STATUS_DISPLAY[complaint.status] ?? STATUS_DISPLAY.consulta_recibida).color
            }`}
          >
            {(STATUS_DISPLAY[complaint.status] ?? STATUS_DISPLAY.consulta_recibida).label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Producto/Servicio</p>
            <p className="font-medium text-slate-700">
              {complaint.producto_servicio ?? "No especificado"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Monto reclamado</p>
            <p className="font-medium text-slate-700">
              {complaint.monto_reclamo != null
                ? `${moneda} $${complaint.monto_reclamo.toLocaleString()}`
                : "No especificado"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Fecha del incidente</p>
            <p className="font-medium text-slate-700">
              {complaint.fecha_incidente ?? "No especificada"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Prob. de exito (consumidor)</p>
            <p className="font-medium text-slate-700">
              {complaint.probabilidad_exito != null
                ? `${Math.round(complaint.probabilidad_exito * 100)}%`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Grievance */}
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-blue-600">
            Reclamo del consumidor
          </p>
          <p className="text-sm leading-relaxed text-blue-800">
            {complaint.core_grievance ?? complaint.relato}
          </p>
        </div>

        {/* Legal analysis */}
        {complaint.probabilidad_exito != null && (
          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
            <p className="mb-1 text-xs font-semibold text-amber-600">
              Analisis legal IA (referencia)
            </p>
            <p className="text-xs text-amber-700">
              La IA estima una probabilidad de{" "}
              <strong>{Math.round(complaint.probabilidad_exito * 100)}%</strong>{" "}
              a favor del consumidor. Responder proactivamente puede reducir
              costos de litigio y mejorar tu reputacion.
            </p>
          </div>
        )}
      </div>

      {/* Previous responses */}
      {complaint.responses.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold text-slate-600">
            Respuestas anteriores
          </h4>
          <div className="space-y-3">
            {complaint.responses.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold capitalize text-slate-600">
                    {r.tipo_respuesta.replace("_", " ")}
                  </span>
                  <span>
                    {new Date(r.created_at).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{r.mensaje}</p>
                {r.propuesta_monto != null && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    Propuesta: ${r.propuesta_monto.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response form */}
      {!success ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-slate-600">
            Responder al reclamo
          </h4>

          {/* Response type selection */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {RESPONSE_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => setSelectedType(rt.value)}
                className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                  selectedType === rt.value
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <rt.icon className={`h-4 w-4 ${rt.color}`} />
                <span className="text-xs font-medium text-slate-700">
                  {rt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Proposal amount (only for "propuesta") */}
          <AnimatePresence>
            {selectedType === "propuesta" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Monto propuesto ({moneda})
                </label>
                <input
                  type="number"
                  value={propuestaMonto}
                  onChange={(e) => setPropuestaMonto(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Mensaje al consumidor
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta al reclamo del consumidor..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleSendResponse}
            disabled={!selectedType || mensaje.trim().length < 10 || sending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Enviando..." : "Enviar respuesta"}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
        >
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">
              Respuesta enviada con exito
            </p>
            <p className="text-sm text-emerald-600">
              El consumidor sera notificado de tu respuesta.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main Page ──

export default function EmpresaPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [view, setView] = useState<DashboardView>("overview");
  const [selectedComplaint, setSelectedComplaint] =
    useState<CompanyCaseView | null>(null);

  const { data, isLoading, isValidating, mutate } = useSWR<EmpresaData>(
    isLoaded && isSignedIn ? "/api/empresa" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      onSuccess: (json) => {
        if (!json.registered) {
          setView(json.suggestion ? "suggestion" : "register");
        }
      },
    }
  );

  const loading = !isLoaded || (isSignedIn && (isLoading || isValidating));

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <Building2 className="mb-4 h-12 w-12 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-800">
          Portal Empresarial
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Inicia sesion para acceder al panel de gestion de reclamos.
        </p>
        <SignInButton mode="modal">
          <button className="mt-6 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-medium text-white">
            Iniciar sesion como empresa
          </button>
        </SignInButton>
        <Link
          href="/"
          className="mt-4 text-sm text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
        >
          Soy consumidor
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800">
                  JustIA Empresas
                </span>
                {data?.account && (
                  <p className="text-xs text-slate-400">
                    {data.account.nombre}
                  </p>
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50"
            >
              Vista consumidor
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        )}

        {!loading && view === "suggestion" && data?.suggestion && (
          <CompanySuggestion
            suggestion={data.suggestion}
            onConfirm={() => {
              mutate();
              setView("overview");
            }}
            onReject={() => setView("register")}
          />
        )}

        {!loading && view === "register" && (
          <RegistrationForm
            prefillName={
              data?.suggestion?.type === "has_complaints"
                ? data.suggestion.empresaName
                : undefined
            }
            onRegistered={() => {
              mutate();
              setView("overview");
            }}
          />
        )}

        {!loading && view === "overview" && data?.registered && data.stats && (
          <div className="space-y-6">
            <StatsGrid stats={data.stats} />
            <MetricsBar stats={data.stats} />

            {/* Complaints list */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <FileText className="h-4 w-4" />
                  Reclamos recibidos
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  {data.complaints?.length ?? 0} total
                </span>
              </div>
              <ComplaintList
                complaints={data.complaints ?? []}
                onSelect={(c) => {
                  setSelectedComplaint(c);
                  setView("detail");
                }}
              />
            </div>
          </div>
        )}

        {!loading &&
          view === "detail" &&
          selectedComplaint &&
          data?.account && (
            <ComplaintDetail
              complaint={selectedComplaint}
              companyId={data.account.id}
              onBack={() => {
                setView("overview");
                setSelectedComplaint(null);
              }}
              onResponded={() => {
                setView("overview");
                setSelectedComplaint(null);
                mutate();
              }}
            />
          )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400">
            JustIA Empresas &mdash; Gestiona reclamos de forma eficiente y
            mejora tu reputacion.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacidad"
              className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Terminos de uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
