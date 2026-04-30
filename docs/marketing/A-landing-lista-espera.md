# A — Landing de Lista de Espera

> Pre-launch landing que reemplaza temporalmente la home pública.
> La app real queda accesible en `/app` (o ruta privada) para QA.

---

## 🎯 Objetivo único

Capturar email + país + tipo de problema → lista para activar el día del launch.

**Métrica única a mover:** emails capturados.

---

## 🏗️ Cómo implementarlo (sin romper la app)

### Opción recomendada: middleware + flag

```
Configuración:
─────────────────────────────────────
NEXT_PUBLIC_PRELAUNCH_MODE=true  → Home muestra lista de espera
NEXT_PUBLIC_PRELAUNCH_MODE=false → Home muestra app real
```

**Flujo de routing:**

```
Visitante a /                ──► /proximamente (landing pre-launch)
Visitante a /app             ──► app real (acceso QA)
Visitante a /empresa/X       ──► páginas SEO (públicas, ver doc B)
Visitante a /guias/X         ──► guías evergreen (públicas, ver doc B)
```

Esto te permite:
- Lanzar SEO ya (públicas)
- Esconder la app con bugs
- QA tiene su acceso por `/app`
- El día del launch, flag a `false` y todo el tráfico va a la app

---

## 📝 Copy completo de la landing

### HERO (above the fold)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   🛡️  JustIA                              [iniciar sesión]  │
│                                                              │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │  PRÓXIMAMENTE EN ARGENTINA Y MÉXICO      │  ← Eyebrow   │
│   └──────────────────────────────────────────┘              │
│                                                              │
│       El abogado de IA que pelea                             │
│       tus reclamos. Gratis.                                  │
│                                                              │
│       Generamos tu reclamo formal en 5 minutos,              │
│       con jurisprudencia real. Sin abogado.                  │
│       Sin filas. Sin frustración.                            │
│                                                              │
│       ┌───────────────────────────────────┐                 │
│       │  tu-email@ejemplo.com             │                 │
│       └───────────────────────────────────┘                 │
│                                                              │
│       ○ 🇦🇷 Argentina    ○ 🇲🇽 México                      │
│                                                              │
│       [   Avisame cuando lance   ]                          │
│                                                              │
│       ✓ 1.247 personas ya están esperando · Sin spam         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Microcopy del contador:** Si tenés <50 emails, no muestres número. Mostrá: "Sé de los primeros 100".

---

### SECCIÓN 2 — "El problema"

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Reclamar como consumidor en LATAM está roto                │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │     ⏱️      │  │     💸      │  │     🤐      │        │
│   │             │  │             │  │             │        │
│   │  PROFECO/   │  │  Abogados   │  │   La empresa│        │
│   │  DCC tarda  │  │  cuestan    │  │   te ignora │        │
│   │  meses      │  │  más que el │  │   y vos te  │        │
│   │             │  │  reclamo    │  │   resignás  │        │
│   └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│   Resultado: 9 de cada 10 personas no reclama. La empresa    │
│   sabe esto. Y abusa.                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### SECCIÓN 3 — "Lo que vamos a hacer"

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Cómo va a funcionar JustIA                                 │
│                                                              │
│   1️⃣  Contás tu caso en 60 segundos                         │
│       Sin formularios infinitos. Cargás un ejemplo si        │
│       no sabés por dónde empezar.                            │
│                                                              │
│   2️⃣  Nuestra IA analiza tu caso                            │
│       Probabilidad de ganar, valor esperado en pesos,        │
│       jurisprudencia real que aplica a tu caso.              │
│                                                              │
│   3️⃣  Mandamos el reclamo formal por vos                    │
│       Carta legal lista, firmada por vos, enviada a la       │
│       empresa con copia a tu email.                          │
│                                                              │
│       [  Avisame cuando lance  ]                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### SECCIÓN 4 — "Stats que SÍ podés mostrar pre-launch"

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Construido sobre datos reales                              │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ 344.500  │  │   100+   │  │    2     │  │    7     │  │
│   │  quejas  │  │   casos  │  │  países  │  │  capas   │  │
│   │  de PRO- │  │  juris-  │  │   AR/MX  │  │  de      │  │
│   │  FECO +  │  │  pruden- │  │          │  │  segu-   │  │
│   │  DCC     │  │  cia     │  │          │  │  ridad   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Por qué funciona pre-launch:** No estás mintiendo sobre usuarios que no tenés. Estás mostrando **el trabajo que ya hiciste**. Eso construye autoridad sin testimoniales.

---

### SECCIÓN 5 — Founder note (opcional pero alta conversión)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Por qué construyo JustIA                                   │
│                                                              │
│   Soy Dante, ingeniero en Argentina. Hace [X meses] una      │
│   empresa me cobró un servicio que cancelé. Llamé 6 veces.   │
│   Hablé con 4 supervisores. Defensa del Consumidor me        │
│   pidió ir presencialmente.                                  │
│                                                              │
│   Recuperé los $X después de [Y semanas]. Pero pensé:        │
│   "esto debería tomar 5 minutos, no 5 semanas."              │
│                                                              │
│   Eso es JustIA. Estoy construyéndolo con un equipo de       │
│   [Z] personas y lanzamos en [mes]. Si te interesa, dejame   │
│   tu email — sos parte de la primera tanda.                  │
│                                                              │
│   [  Avisame cuando lance  ]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

⚠️ **Adaptá la historia con TUS datos reales.** Si no tenés una historia personal, sacá la sección. Mejor sin que falsa.

---

### SECCIÓN 6 — Footer minimal

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   JustIA — Cuando una empresa falla, tus derechos no.        │
│                                                              │
│   © 2026  ·  Hecho en Argentina 🇦🇷  ·  contacto@justia.app │
│                                                              │
│   Privacidad  ·  Términos  ·  Twitter  ·  LinkedIn           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 💻 Código: componente Next.js listo para pegar

Crear: `src/app/proximamente/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ProximamentePage() {
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState<"AR" | "MX" | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pais) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pais }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-6 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Próximamente en Argentina y México
        </div>

        <h1 className="text-5xl font-black leading-tight md:text-7xl">
          El abogado de IA que pelea
          <br />
          tus reclamos. <span className="text-amber-400">Gratis.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-slate-300 md:text-2xl">
          Generamos tu reclamo formal en 5 minutos, con jurisprudencia real.
          Sin abogado. Sin filas. Sin frustración.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-10 max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />

            <div className="mt-4 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pais"
                  checked={pais === "AR"}
                  onChange={() => setPais("AR")}
                />
                <span>🇦🇷 Argentina</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pais"
                  checked={pais === "MX"}
                  onChange={() => setPais("MX")}
                />
                <span>🇲🇽 México</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !pais}
              className="mt-6 w-full rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Anotándote..." : "Avisame cuando lance"}
            </button>

            <p className="mt-3 text-sm text-slate-400">
              ✓ Sé de los primeros 100 · Sin spam
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6"
          >
            <p className="text-lg font-semibold text-emerald-400">
              ✓ Listo. Vas a ser de los primeros en saber.
            </p>
            <p className="mt-2 text-slate-300">
              Mientras tanto, seguinos en{" "}
              <a href="https://twitter.com/" className="underline">
                X
              </a>{" "}
              donde compartimos el progreso.
            </p>
          </motion.div>
        )}
      </section>

      {/* PROBLEMA, SOLUCIÓN, STATS — replicá las secciones del copy de arriba */}
    </div>
  );
}
```

---

## 🔌 API endpoint para capturar (Supabase)

Crear: `src/app/api/waitlist/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const Schema = z.object({
  email: z.string().email(),
  pais: z.enum(["AR", "MX"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: parsed.data.email, pais: parsed.data.pais });

  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

**Migration Supabase:**

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  pais text not null check (pais in ('AR','MX')),
  created_at timestamptz default now(),
  source text  -- para tracking: 'tiktok', 'twitter', 'guia-mercado-libre', etc.
);

create index waitlist_pais_idx on waitlist(pais);
```

---

## 📊 Eventos PostHog a trackear

```
waitlist_view              ← cargó la página
waitlist_email_focused     ← clickeó el input
waitlist_country_selected  ← eligió país
waitlist_submitted         ← envió el form
waitlist_error             ← falló el submit
```

**Funnel objetivo:** view → submitted ≥ 8% (benchmark de waitlists pre-launch).

---

## ⚙️ Setup técnico final

1. Variable de entorno: `NEXT_PUBLIC_PRELAUNCH_MODE=true`
2. Middleware en `middleware.ts`:
   ```ts
   if (process.env.NEXT_PUBLIC_PRELAUNCH_MODE === "true" && pathname === "/") {
     return NextResponse.redirect(new URL("/proximamente", req.url));
   }
   ```
3. La app real queda en `/app` durante pre-launch.
4. Día del launch: flag a `false`, redirect inverso o eliminar el middleware.

---

## ✅ Checklist de implementación

- [ ] Crear tabla `waitlist` en Supabase
- [ ] Crear `src/app/proximamente/page.tsx` con el componente
- [ ] Crear `src/app/api/waitlist/route.ts`
- [ ] Agregar middleware con flag de pre-launch
- [ ] Setear `NEXT_PUBLIC_PRELAUNCH_MODE=true` en Vercel
- [ ] Configurar eventos PostHog
- [ ] Test del flujo end-to-end (email se guarda, no acepta duplicados)
- [ ] Confirmar que `/app` funciona para QA
