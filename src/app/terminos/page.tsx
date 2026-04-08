import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description:
    "Términos y condiciones de uso de JustIA Consumidor. Reglas que rigen el uso de la plataforma.",
};

export default function TerminosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Términos de Uso
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-400">
            Última actualización: 5 de abril de 2026
          </p>

          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar JustIA Consumidor (&quot;la plataforma&quot;,
            &quot;el servicio&quot;), aceptás estos Términos de Uso en su
            totalidad. Si no estás de acuerdo con alguna parte de estos
            términos, no debés utilizar la plataforma.
          </p>

          <h2>2. Descripción del servicio</h2>
          <p>
            JustIA Consumidor es una plataforma de Resolución de Disputas en
            Línea (ODR) que utiliza inteligencia artificial para:
          </p>
          <ul>
            <li>
              Analizar reclamos de consumo y proporcionar orientación legal
              basada en la legislación de Argentina (Ley 24.240) y México (LFPC).
            </li>
            <li>
              Generar documentos de reclamo formal para enviar a empresas.
            </li>
            <li>
              Simular procesos de arbitraje para evaluar las posiciones de ambas
              partes.
            </li>
            <li>
              Calcular métricas financieras (valor esperado) para ayudar en la
              toma de decisiones.
            </li>
            <li>Permitir el seguimiento del estado de los reclamos.</li>
          </ul>

          <h2>3. Naturaleza del servicio — NO es asesoramiento legal</h2>
          <p>
            <strong>
              AVISO IMPORTANTE: JustIA Consumidor NO es un estudio jurídico, NO
              presta servicios de abogacía y NO reemplaza el asesoramiento legal
              profesional.
            </strong>
          </p>
          <ul>
            <li>
              Los análisis, recomendaciones y documentos generados por la
              plataforma son <strong>orientativos</strong> y se basan en
              procesamiento automatizado de información.
            </li>
            <li>
              Las probabilidades de éxito y las métricas financieras son
              <strong> estimaciones estadísticas</strong>, no predicciones
              garantizadas.
            </li>
            <li>
              Los documentos generados son <strong>modelos de referencia</strong>
              {" "}que pueden requerir ajustes según las circunstancias
              específicas de cada caso.
            </li>
            <li>
              El simulador de arbitraje es una <strong>herramienta educativa</strong>
              {" "}y no tiene validez legal ni constituye un arbitraje real.
            </li>
            <li>
              <strong>
                Recomendamos consultar con un abogado matriculado antes de tomar
                decisiones legales basadas en la información proporcionada por
                esta plataforma.
              </strong>
            </li>
          </ul>

          <h2>4. Registro y cuenta</h2>
          <ul>
            <li>
              Para acceder a ciertas funcionalidades (historial de casos, envío
              de reclamos), debés crear una cuenta.
            </li>
            <li>
              Sos responsable de mantener la confidencialidad de tus
              credenciales de acceso.
            </li>
            <li>
              Debés proporcionar información veraz y actualizada.
            </li>
            <li>
              Nos reservamos el derecho de suspender o eliminar cuentas que
              violen estos términos.
            </li>
          </ul>

          <h2>5. Uso aceptable</h2>
          <p>Al utilizar la plataforma, te comprometés a:</p>
          <ul>
            <li>
              Proporcionar información veraz y precisa en tus reclamos.
            </li>
            <li>
              No utilizar la plataforma para fines fraudulentos, difamatorios o
              ilegales.
            </li>
            <li>
              No intentar acceder a datos de otros usuarios ni comprometer la
              seguridad de la plataforma.
            </li>
            <li>
              No realizar solicitudes masivas automatizadas (spam, scraping,
              ataques de denegación de servicio).
            </li>
            <li>
              No utilizar la plataforma para generar reclamos falsos o
              infundados.
            </li>
            <li>
              Respetar los límites de uso establecidos (rate limiting) como
              medida de protección del servicio.
            </li>
          </ul>

          <h2>6. Propiedad intelectual</h2>
          <ul>
            <li>
              El código fuente, diseño, textos, logos y contenido de la
              plataforma son propiedad de JustIA Consumidor o de sus
              licenciantes.
            </li>
            <li>
              Los documentos de reclamo generados por la plataforma pueden ser
              utilizados libremente por el usuario para los fines de su reclamo.
            </li>
            <li>
              Los datos de jurisprudencia mostrados son de dominio público y se
              proporcionan con fines informativos.
            </li>
          </ul>

          <h2>7. Limitación de responsabilidad</h2>
          <p>
            <strong>En la máxima medida permitida por la ley aplicable:</strong>
          </p>
          <ul>
            <li>
              La plataforma se proporciona &quot;tal cual&quot; (&quot;as
              is&quot;) y &quot;según disponibilidad&quot; (&quot;as
              available&quot;), sin garantías de ningún tipo, expresas o
              implícitas.
            </li>
            <li>
              No garantizamos la exactitud, completitud o actualidad de los
              análisis legales, probabilidades de éxito ni recomendaciones
              generadas.
            </li>
            <li>
              No somos responsables por daños directos, indirectos,
              incidentales, consecuentes o punitivos derivados del uso o la
              imposibilidad de uso de la plataforma.
            </li>
            <li>
              No somos responsables por las acciones u omisiones de las
              empresas reclamadas ni por el resultado de los reclamos.
            </li>
            <li>
              No garantizamos la entrega de correos electrónicos enviados a
              través de la plataforma, ni que las empresas respondan a los
              reclamos.
            </li>
            <li>
              El usuario asume toda responsabilidad por las decisiones tomadas
              en base a la información proporcionada por la plataforma.
            </li>
          </ul>

          <h2>8. Indemnización</h2>
          <p>
            Aceptás indemnizar y mantener indemne a JustIA Consumidor, sus
            creadores, colaboradores y proveedores de servicios frente a
            cualquier reclamo, daño, pérdida, costo o gasto (incluyendo
            honorarios legales razonables) que surja de tu uso de la plataforma,
            tu violación de estos términos, o tu violación de derechos de
            terceros.
          </p>

          <h2>9. Disponibilidad del servicio</h2>
          <ul>
            <li>
              Nos esforzamos por mantener la plataforma disponible, pero no
              garantizamos un servicio ininterrumpido.
            </li>
            <li>
              Podemos modificar, suspender o descontinuar el servicio (o
              cualquier parte del mismo) en cualquier momento, con o sin previo
              aviso.
            </li>
            <li>
              Realizamos mantenimiento periódico que puede afectar
              temporalmente la disponibilidad.
            </li>
          </ul>

          <h2>10. Privacidad</h2>
          <p>
            El tratamiento de tus datos personales se rige por nuestra{" "}
            <Link href="/privacidad" className="text-blue-600 hover:underline">
              Política de Privacidad
            </Link>
            , que forma parte integral de estos Términos de Uso.
          </p>

          <h2>11. Modificaciones a los términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier
            momento. Los cambios entrarán en vigor al ser publicados en la
            plataforma. El uso continuado del servicio después de la publicación
            de modificaciones constituye tu aceptación de los términos
            actualizados.
          </p>

          <h2>12. Legislación aplicable y jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina.
            Para usuarios en México, se aplicarán las disposiciones de la
            legislación mexicana que resulten más favorables al consumidor
            conforme al principio pro-consumidor. Cualquier controversia será
            sometida a la jurisdicción de los tribunales competentes del
            domicilio del usuario.
          </p>

          <h2>13. Divisibilidad</h2>
          <p>
            Si alguna disposición de estos términos fuera declarada inválida o
            inaplicable, las disposiciones restantes continuarán en pleno vigor
            y efecto.
          </p>

          <h2>14. Contacto</h2>
          <p>
            Para consultas sobre estos términos, contactanos en:{" "}
            <strong>legal@justia-consumidor.com</strong>
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-400">
          JustIA Consumidor &mdash; Cuando una empresa falla, tus derechos no
          deben fallar contigo.
        </p>
      </footer>
    </div>
  );
}
