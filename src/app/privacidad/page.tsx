import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de JustIA Consumidor. Cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-400">
            Última actualización: 5 de abril de 2026
          </p>

          <h2>1. Información que recopilamos</h2>
          <p>
            JustIA Consumidor (&quot;nosotros&quot;, &quot;la plataforma&quot;)
            recopila la siguiente información cuando utilizás nuestros servicios:
          </p>
          <ul>
            <li>
              <strong>Datos de cuenta:</strong> nombre, dirección de correo
              electrónico y datos de autenticación proporcionados a través de
              nuestro proveedor de autenticación (Clerk).
            </li>
            <li>
              <strong>Datos del reclamo:</strong> el relato de tu caso, nombre
              de la empresa reclamada, montos, y cualquier información que
              incluyas voluntariamente en tu reclamo.
            </li>
            <li>
              <strong>Datos de uso:</strong> información anónima sobre cómo
              interactuás con la plataforma, páginas visitadas y funcionalidades
              utilizadas, recopilada a través de PostHog.
            </li>
            <li>
              <strong>Datos técnicos:</strong> dirección IP (para rate limiting
              y seguridad), tipo de navegador, y datos de errores recopilados
              por Sentry para mejorar la estabilidad del servicio.
            </li>
          </ul>

          <h2>2. Cómo usamos tu información</h2>
          <p>Utilizamos tu información exclusivamente para:</p>
          <ul>
            <li>
              Analizar tu caso de consumo mediante inteligencia artificial y
              generar recomendaciones legales orientativas.
            </li>
            <li>
              Generar documentos de reclamo formal para enviar a la empresa
              reclamada.
            </li>
            <li>
              Enviar correos electrónicos transaccionales (confirmaciones de
              reclamo, notificaciones de estado).
            </li>
            <li>
              Mantener el historial de tus casos para que puedas darles
              seguimiento.
            </li>
            <li>
              Mejorar la calidad y seguridad de la plataforma mediante análisis
              agregados y anónimos.
            </li>
          </ul>

          <h2>3. Bases legales del tratamiento</h2>
          <p>
            Procesamos tus datos personales bajo las siguientes bases legales:
          </p>
          <ul>
            <li>
              <strong>Consentimiento:</strong> al registrarte y utilizar la
              plataforma, consentís el tratamiento de tus datos conforme a esta
              política.
            </li>
            <li>
              <strong>Ejecución contractual:</strong> el procesamiento es
              necesario para brindarte el servicio solicitado.
            </li>
            <li>
              <strong>Interés legítimo:</strong> para prevenir fraude, garantizar
              la seguridad y mejorar el servicio.
            </li>
          </ul>

          <h2>4. Compartición de datos</h2>
          <p>
            <strong>No vendemos tus datos personales.</strong> Solo compartimos
            información con:
          </p>
          <ul>
            <li>
              <strong>La empresa reclamada:</strong> cuando vos mismo decidís
              enviar un reclamo formal, compartimos los datos que incluiste en
              el reclamo con la empresa destinataria.
            </li>
            <li>
              <strong>Proveedores de servicios:</strong> utilizamos servicios
              de terceros para operar la plataforma (Supabase para base de
              datos, Clerk para autenticación, Resend para emails, Pinecone para
              búsqueda semántica, PostHog para analytics, Sentry para monitoreo
              de errores, Upstash para rate limiting). Estos proveedores procesan
              datos según sus propias políticas de privacidad y solo en la medida
              necesaria para brindarnos el servicio.
            </li>
            <li>
              <strong>Requerimiento legal:</strong> si estamos obligados por ley,
              orden judicial o requerimiento de autoridad competente.
            </li>
          </ul>

          <h2>5. Almacenamiento y seguridad</h2>
          <p>Tu información se almacena de forma segura mediante:</p>
          <ul>
            <li>Cifrado en tránsito (HTTPS/TLS) en todas las comunicaciones.</li>
            <li>
              Row Level Security (RLS) en la base de datos, garantizando que
              solo vos podés acceder a tus propios casos.
            </li>
            <li>
              Validación de entrada con Zod en todas las rutas API para prevenir
              inyección de datos maliciosos.
            </li>
            <li>
              Rate limiting para proteger contra abuso y ataques de fuerza
              bruta.
            </li>
            <li>
              Content Security Policy (CSP) y headers de seguridad HTTP para
              proteger contra XSS y otros ataques web.
            </li>
          </ul>

          <h2>6. Retención de datos</h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa en la
            plataforma. Podés solicitar la eliminación de tu cuenta y datos
            asociados en cualquier momento contactándonos por correo
            electrónico.
          </p>

          <h2>7. Tus derechos</h2>
          <p>
            Conforme a la legislación aplicable (Ley 25.326 de Protección de
            Datos Personales de Argentina, Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares de México, y normativa
            concordante), tenés derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> solicitar una copia de tus datos
              personales.
            </li>
            <li>
              <strong>Rectificación:</strong> corregir datos inexactos o
              incompletos.
            </li>
            <li>
              <strong>Supresión:</strong> solicitar la eliminación de tus datos.
            </li>
            <li>
              <strong>Oposición:</strong> oponerte al tratamiento de tus datos
              en ciertos casos.
            </li>
            <li>
              <strong>Portabilidad:</strong> recibir tus datos en un formato
              estructurado y legible por máquina.
            </li>
          </ul>

          <h2>8. Inteligencia artificial</h2>
          <p>
            Utilizamos modelos de inteligencia artificial para analizar tu
            reclamo y generar recomendaciones. Es importante que sepas:
          </p>
          <ul>
            <li>
              El análisis de IA es <strong>orientativo</strong> y no constituye
              asesoramiento legal profesional.
            </li>
            <li>
              Las probabilidades de éxito son estimaciones basadas en patrones
              y no garantizan un resultado.
            </li>
            <li>
              No almacenamos el contenido de tus consultas en los servidores
              del modelo de IA más allá de lo necesario para generar la
              respuesta.
            </li>
            <li>
              Te recomendamos consultar con un abogado para decisiones legales
              importantes.
            </li>
          </ul>

          <h2>9. Cookies y tecnologías de rastreo</h2>
          <p>
            Utilizamos cookies estrictamente necesarias para la autenticación
            (Clerk) y cookies analíticas (PostHog) para entender cómo se usa la
            plataforma. PostHog está configurado para crear perfiles solo de
            usuarios identificados, no de visitantes anónimos.
          </p>

          <h2>10. Menores de edad</h2>
          <p>
            La plataforma no está dirigida a menores de 18 años. No recopilamos
            intencionalmente datos de menores. Si sos padre o tutor y creés que
            un menor nos proporcionó datos, contactanos para que los eliminemos.
          </p>

          <h2>11. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos de
            cambios significativos mediante un aviso en la plataforma. El uso
            continuado del servicio después de la publicación de cambios
            constituye tu aceptación de la política actualizada.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para ejercer tus derechos o consultas sobre privacidad, contactanos
            en: <strong>privacidad@justia-consumidor.com</strong>
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
