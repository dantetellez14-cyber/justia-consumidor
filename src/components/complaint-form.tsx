"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  HelpCircle,
  X,
  ShoppingBag,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Target,
  ChevronDown,
} from "lucide-react";

// ── Categories based on PROFECO + Defensa del Consumidor research ──

const COMPLAINT_CATEGORIES = [
  { value: "electronica", label: "Electrónica y tecnología", emoji: "📱" },
  { value: "electrodomesticos", label: "Electrodomésticos", emoji: "🏠" },
  { value: "telecomunicaciones", label: "Telecomunicaciones e internet", emoji: "📡" },
  { value: "servicios_financieros", label: "Servicios financieros y bancos", emoji: "🏦" },
  { value: "comercio_electronico", label: "Compras online / e-commerce", emoji: "🛒" },
  { value: "transporte", label: "Transporte y aerolíneas", emoji: "✈️" },
  { value: "automotriz", label: "Automotriz (vehículos, talleres)", emoji: "🚗" },
  { value: "servicios_publicos", label: "Servicios públicos (luz, gas, agua)", emoji: "💡" },
  { value: "salud", label: "Salud, medicina prepaga u obras sociales", emoji: "🏥" },
  { value: "educacion", label: "Educación privada", emoji: "🎓" },
  { value: "inmobiliaria", label: "Inmobiliaria y construcción", emoji: "🏗️" },
  { value: "alimentos", label: "Alimentos y bebidas", emoji: "🍽️" },
  { value: "indumentaria", label: "Indumentaria y calzado", emoji: "👟" },
  { value: "turismo", label: "Turismo y hotelería", emoji: "🏨" },
  { value: "otro", label: "Otro", emoji: "📋" },
] as const;

const PURCHASE_CHANNELS = [
  { value: "online", label: "Tienda online" },
  { value: "local", label: "Local comercial" },
  { value: "telefono", label: "Por teléfono" },
  { value: "redes", label: "Redes sociales" },
  { value: "puerta", label: "Venta a domicilio" },
] as const;

const DESIRED_RESOLUTIONS = [
  { value: "reembolso", label: "Devolución del dinero" },
  { value: "cambio", label: "Cambio del producto" },
  { value: "reparacion", label: "Reparación sin costo" },
  { value: "cancelacion", label: "Cancelación del servicio/contrato" },
  { value: "compensacion", label: "Compensación o indemnización" },
  { value: "cumplimiento", label: "Que cumplan lo prometido" },
] as const;

// ── Field examples (tooltips) ──

interface FieldExample {
  readonly title: string;
  readonly examples: ReadonlyArray<string>;
}

const FIELD_EXAMPLES: Record<string, FieldExample> = {
  producto: {
    title: "Ejemplos de producto o servicio",
    examples: [
      'Smart TV Samsung 55" 4K',
      "Plan de internet fibra óptica 100Mbps",
      "Tarjeta de crédito Visa Gold",
      "Vuelo Buenos Aires → Cancún",
      "Smartphone iPhone 15 128GB",
      "Seguro automotor todo riesgo",
    ],
  },
  empresa: {
    title: "Ejemplos de empresa o proveedor",
    examples: [
      "MercadoLibre",
      "Personal / Movistar / Claro",
      "Despegar.com",
      "Samsung Argentina",
      "Banco Galicia",
      "Liverpool / Elektra / Coppel",
    ],
  },
  problema: {
    title: "Reclamos más comunes",
    examples: [
      "El producto llegó dañado o con defectos de fábrica",
      "No me entregan lo que compré o hay demoras excesivas",
      "Me cobran de más o aparecen cargos que no reconozco",
      "El producto es diferente a lo que mostraba la publicidad",
      "No respetan la garantía o se niegan a hacer el cambio",
      "Me quieren cobrar por cancelar un servicio sin justa causa",
      "La empresa no responde mis reclamos ni da soluciones",
    ],
  },
  contacto: {
    title: "Ejemplos de contacto previo",
    examples: [
      "Llamé al 0800 el 15/03 y me dieron número de reclamo #4567 sin resolución",
      "Envié un email a soporte@empresa.com el 20/03 y no respondieron",
      "Fui a la sucursal de Av. Corrientes y me dijeron que no se hacen cargo",
      "Hice el reclamo por la app y me cerraron el caso sin solución",
    ],
  },
};

// ── Example form data (rotates through real companies with most complaints) ──

const EXAMPLE_CASES: ReadonlyArray<ComplaintFormData> = [
  {
    categoria: "telecomunicaciones",
    producto: "Plan de internet fibra óptica 100Mbps",
    empresa: "Personal",
    monto: "45000",
    moneda: "ARS",
    fechaCompra: "2026-01-15",
    canalCompra: "telefono",
    problema:
      "Hace 3 meses que tengo cortes de internet diarios. La velocidad contratada es de 100Mbps pero nunca supera los 20Mbps. Llamé más de 10 veces y cada vez me dan un número de reclamo diferente sin solución.",
    contactoEmpresa: true,
    detalleContacto:
      "Llamé al 0800-345-1515 en 5 ocasiones. Me dieron los folios #AR-2026-1234 y #AR-2026-5678. Un técnico vino una vez pero el problema persiste. Pedí la baja y me quieren cobrar penalización.",
    resolucionDeseada: ["reembolso", "cancelacion"],
  },
  {
    categoria: "comercio_electronico",
    producto: "Notebook Lenovo IdeaPad 15.6\" 512GB SSD",
    empresa: "MercadoLibre Argentina",
    monto: "650000",
    moneda: "ARS",
    fechaCompra: "2026-02-28",
    canalCompra: "online",
    problema:
      "Compré una notebook que decía 'nueva' en la publicación pero llegó con la caja abierta, rayones en la tapa y la batería no carga más de 30 minutos. El vendedor no responde mensajes y MercadoLibre cerró mi reclamo diciendo que el plazo de devolución ya venció.",
    contactoEmpresa: true,
    detalleContacto:
      "Abrí reclamo en MercadoLibre el día que recibí el producto. Subí fotos y video del defecto. Me respondieron con un mensaje automático y cerraron el caso a los 5 días sin resolución.",
    resolucionDeseada: ["reembolso", "cambio"],
  },
  {
    categoria: "transporte",
    producto: "Vuelo CDMX → Cancún, 2 pasajeros",
    empresa: "Volaris",
    monto: "8500",
    moneda: "MXN",
    fechaCompra: "2026-03-01",
    canalCompra: "online",
    problema:
      "Cancelaron mi vuelo 4 horas antes de la salida sin dar opciones de reubicación. Tuve que comprar boletos de última hora con otra aerolínea por el triple del precio. No me ofrecieron reembolso, solo un cupón de descuento para compras futuras.",
    contactoEmpresa: true,
    detalleContacto:
      "Llamé al centro de atención de Volaris. Me tuvieron en espera 2 horas. Me ofrecieron un voucher de $2,000 MXN válido por 3 meses, lo cual no cubre ni el 25% de lo que gasté en los boletos de reemplazo.",
    resolucionDeseada: ["reembolso", "compensacion"],
  },
  {
    categoria: "electronica",
    producto: "Lavarropas automático Samsung 10kg",
    empresa: "Fravega",
    monto: "420000",
    moneda: "ARS",
    fechaCompra: "2026-02-10",
    canalCompra: "online",
    problema:
      "El lavarropas dejó de centrifugar a las 3 semanas de uso. El servicio técnico vino, dijo que era un defecto de fábrica y que tenían que pedir un repuesto. Pasaron 2 meses y no me dan respuesta ni fecha de reparación.",
    contactoEmpresa: true,
    detalleContacto:
      "Fui a la sucursal de Av. Corrientes donde me dijeron que era tema del servicio técnico. El servicio técnico dice que es tema de Fravega. Nadie se hace cargo. Tengo el folio de reclamo #FRV-2026-8821.",
    resolucionDeseada: ["cambio", "reparacion"],
  },
  {
    categoria: "servicios_financieros",
    producto: "Tarjeta de crédito Visa Gold",
    empresa: "BBVA México",
    monto: "15000",
    moneda: "MXN",
    fechaCompra: "2025-12-15",
    canalCompra: "local",
    problema:
      "Aparecieron 3 cargos no reconocidos en mi estado de cuenta por compras en línea que nunca realicé. Cuando reporté, me dijeron que la investigación tarda 45 días hábiles y que mientras tanto debo seguir pagando los cargos para no generar intereses.",
    contactoEmpresa: true,
    detalleContacto:
      "Llamé a la línea de atención BBVA y levanté el folio de aclaración #CLR-2026-44521. En sucursal me dijeron lo mismo. Ya pasaron 60 días y no tengo resolución.",
    resolucionDeseada: ["reembolso", "compensacion"],
  },
];

function getRandomExample(): ComplaintFormData {
  const index = Math.floor(Math.random() * EXAMPLE_CASES.length);
  return EXAMPLE_CASES[index];
}

// ── Types ──

export interface ComplaintFormData {
  categoria: string;
  producto: string;
  empresa: string;
  monto: string;
  moneda: "ARS" | "MXN";
  fechaCompra: string;
  canalCompra: string;
  problema: string;
  contactoEmpresa: boolean;
  detalleContacto: string;
  resolucionDeseada: string[];
}

interface Props {
  readonly onSubmit: (relato: string, formData: ComplaintFormData) => void;
  readonly loading: boolean;
  readonly error: string | null;
}

// ── Tooltip Popover component ──

function ExamplePopover({
  fieldKey,
  open,
  onToggle,
}: {
  readonly fieldKey: string;
  readonly open: boolean;
  readonly onToggle: () => void;
}) {
  const data = FIELD_EXAMPLES[fieldKey];
  if (!data) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
        aria-label={`Ver ejemplos de ${fieldKey}`}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">{data.title}</p>
              <button
                type="button"
                onClick={onToggle}
                className="rounded p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-1.5">
              {data.examples.map((ex) => (
                <li
                  key={ex}
                  className="flex items-start gap-2 text-xs text-slate-500"
                >
                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  {ex}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Form Component ──

export function ComplaintForm({ onSubmit, loading, error }: Props) {
  const [form, setForm] = useState<ComplaintFormData>({
    categoria: "",
    producto: "",
    empresa: "",
    monto: "",
    moneda: "ARS",
    fechaCompra: "",
    canalCompra: "",
    problema: "",
    contactoEmpresa: false,
    detalleContacto: "",
    resolucionDeseada: [],
  });

  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ComplaintFormData>(key: K, value: ComplaintFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleResolution = useCallback((value: string) => {
    setForm((prev) => {
      const current = prev.resolucionDeseada;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, resolucionDeseada: next };
    });
  }, []);

  const loadExample = useCallback(() => {
    setForm(getRandomExample());
  }, []);

  const isValid =
    form.producto.trim().length >= 3 &&
    form.empresa.trim().length >= 2 &&
    form.problema.trim().length >= 10;

  const buildRelato = useCallback((): string => {
    const categoryLabel =
      COMPLAINT_CATEGORIES.find((c) => c.value === form.categoria)?.label ?? "";
    const channelLabel =
      PURCHASE_CHANNELS.find((c) => c.value === form.canalCompra)?.label ?? "";
    const resolutionLabels = form.resolucionDeseada
      .map((r) => DESIRED_RESOLUTIONS.find((d) => d.value === r)?.label)
      .filter(Boolean);

    const parts: string[] = [];

    if (form.monto && form.fechaCompra) {
      parts.push(
        `Compré ${form.producto} en ${form.empresa} el ${form.fechaCompra} por $${Number(form.monto).toLocaleString("es")} ${form.moneda}${channelLabel ? ` (${channelLabel.toLowerCase()})` : ""}.`
      );
    } else if (form.monto) {
      parts.push(
        `Compré ${form.producto} en ${form.empresa} por $${Number(form.monto).toLocaleString("es")} ${form.moneda}${channelLabel ? ` (${channelLabel.toLowerCase()})` : ""}.`
      );
    } else {
      parts.push(
        `Contraté/compré ${form.producto} en ${form.empresa}${channelLabel ? ` (${channelLabel.toLowerCase()})` : ""}.`
      );
    }

    if (categoryLabel) {
      parts.push(`Categoría: ${categoryLabel}.`);
    }

    parts.push(form.problema);

    if (form.contactoEmpresa && form.detalleContacto.trim()) {
      parts.push(`Contacto previo con la empresa: ${form.detalleContacto}`);
    } else if (form.contactoEmpresa) {
      parts.push("Ya contacté a la empresa pero no obtuve solución.");
    }

    if (resolutionLabels.length > 0) {
      parts.push(`Resolución deseada: ${resolutionLabels.join(", ")}.`);
    }

    return parts.join(" ");
  }, [form]);

  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    onSubmit(buildRelato(), form);
  }, [isValid, onSubmit, buildRelato, form]);

  const togglePopover = useCallback(
    (key: string) => {
      setOpenPopover(openPopover === key ? null : key);
    },
    [openPopover]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Contanos qué pasó</h2>
          <p className="mt-1 text-sm text-slate-500">
            Completá los datos de tu reclamo. Cuanta más información, mejor el
            análisis.
          </p>
        </div>

        {/* Load Example */}
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={loadExample}
            className="flex items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Cargar ejemplo
          </button>
        </div>

        <div className="space-y-5">
          {/* ── 1. Categoría ── */}
          <fieldset>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <ShoppingBag className="h-4 w-4 text-slate-400" />
              Categoría del producto o servicio
            </label>
            <div className="relative">
              <select
                value={form.categoria}
                onChange={(e) => updateField("categoria", e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Seleccioná una categoría</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </fieldset>

          {/* ── 2. Producto o servicio ── */}
          <fieldset>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                Producto o servicio
                <span className="text-red-400">*</span>
              </label>
              <ExamplePopover
                fieldKey="producto"
                open={openPopover === "producto"}
                onToggle={() => togglePopover("producto")}
              />
            </div>
            <input
              type="text"
              value={form.producto}
              onChange={(e) => updateField("producto", e.target.value)}
              placeholder='Ej: Smart TV Samsung 55" 4K'
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </fieldset>

          {/* ── 3. Empresa ── */}
          <fieldset>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Building2 className="h-4 w-4 text-slate-400" />
                Empresa o proveedor
                <span className="text-red-400">*</span>
              </label>
              <ExamplePopover
                fieldKey="empresa"
                open={openPopover === "empresa"}
                onToggle={() => togglePopover("empresa")}
              />
            </div>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => updateField("empresa", e.target.value)}
              placeholder="Ej: MercadoLibre, Movistar, Samsung..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </fieldset>

          {/* ── 4. Monto + Moneda + Fecha (row) ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Monto */}
            <fieldset className="sm:col-span-1">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <DollarSign className="h-4 w-4 text-slate-400" />
                Monto pagado
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) => updateField("monto", e.target.value)}
                  placeholder="450000"
                  min="0"
                  className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <select
                  value={form.moneda}
                  onChange={(e) =>
                    updateField("moneda", e.target.value as "ARS" | "MXN")
                  }
                  className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ARS">ARS</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>
            </fieldset>

            {/* Fecha */}
            <fieldset className="sm:col-span-1">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="h-4 w-4 text-slate-400" />
                Fecha de compra
              </label>
              <input
                type="date"
                value={form.fechaCompra}
                onChange={(e) => updateField("fechaCompra", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </fieldset>

            {/* Canal de compra */}
            <fieldset className="sm:col-span-1">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <ShoppingBag className="h-4 w-4 text-slate-400" />
                Canal de compra
              </label>
              <div className="relative">
                <select
                  value={form.canalCompra}
                  onChange={(e) => updateField("canalCompra", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Seleccionar</option>
                  {PURCHASE_CHANNELS.map((ch) => (
                    <option key={ch.value} value={ch.value}>
                      {ch.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </fieldset>
          </div>

          {/* ── 5. ¿Qué problema tuviste? ── */}
          <fieldset>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <AlertTriangle className="h-4 w-4 text-slate-400" />
                ¿Qué problema tuviste?
                <span className="text-red-400">*</span>
              </label>
              <ExamplePopover
                fieldKey="problema"
                open={openPopover === "problema"}
                onToggle={() => togglePopover("problema")}
              />
            </div>
            <textarea
              value={form.problema}
              onChange={(e) => updateField("problema", e.target.value)}
              placeholder="Describí qué pasó con el producto o servicio. Cuanto más detalle, mejor podremos analizar tu caso..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </fieldset>

          {/* ── 6. ¿Contactaste a la empresa? ── */}
          <fieldset>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                ¿Ya contactaste a la empresa?
              </label>
              <ExamplePopover
                fieldKey="contacto"
                open={openPopover === "contacto"}
                onToggle={() => togglePopover("contacto")}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField("contactoEmpresa", true)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.contactoEmpresa
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sí, ya los contacté
              </button>
              <button
                type="button"
                onClick={() => {
                  updateField("contactoEmpresa", false);
                  updateField("detalleContacto", "");
                }}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  !form.contactoEmpresa
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                No todavía
              </button>
            </div>
            <AnimatePresence>
              {form.contactoEmpresa && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={form.detalleContacto}
                    onChange={(e) =>
                      updateField("detalleContacto", e.target.value)
                    }
                    placeholder="Contanos qué te dijeron: fecha, canal (teléfono, email, sucursal), respuesta de la empresa..."
                    rows={3}
                    className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </fieldset>

          {/* ── 7. Resolución deseada ── */}
          <fieldset>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Target className="h-4 w-4 text-slate-400" />
              ¿Qué solución buscás?
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DESIRED_RESOLUTIONS.map((res) => (
                <button
                  key={res.value}
                  type="button"
                  onClick={() => toggleResolution(res.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    form.resolucionDeseada.includes(res.value)
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            "Analizando..."
          ) : (
            <>
              <Send className="h-4 w-4" />
              Analizar mi caso
            </>
          )}
        </button>

        {/* Validation hint */}
        {!isValid && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Completá al menos producto, empresa y descripción del problema
          </p>
        )}
      </div>
    </motion.div>
  );
}
