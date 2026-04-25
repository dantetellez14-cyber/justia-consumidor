# Resumen de Sesión: Estado del Proyecto, Seguridad y Estrategia de Dominio

> **Fecha:** 20 de Abril de 2026
> **Proyecto:** JustIA Consumidor

## 1. Estado General de la Aplicación y Sistemas
Se realizó una auditoría del estado actual de JustIA Consumidor basándose en el repositorio y los dashboards integrados. 
* **Lo que está funcionando:** La arquitectura base (Next.js, Vercel, Supabase, Clerk) está en producción. Las validaciones, rate limiting (Upstash), analíticas (PostHog) y monitoreo (Sentry) operan correctamente.
* **El problema crítico en Producción:** El entorno de Vercel está fallando silenciosamente en la ruta `/api/analyze` debido a que intenta conectarse a un servidor local de Ollama inexistente. En la nube devuelve un *mock* de demostración.
* **El problema de Emails:** Los correos de Resend están cayendo en SPAM o rebotando porque falta asociar y verificar un dominio propio (DNS: SPF/DKIM).

## 2. Seguridad (Row Level Security - RLS)
* Se verificó que las **políticas RLS de Supabase ya fueron aplicadas exitosamente** en una sesión anterior. 
* Las tablas sensibles (`cases`, `feedback`, `company_users`) están protegidas con una política *deny-all* por defecto para los usuarios anónimos (anon key).
* El servidor de Next.js opera correctamente y de forma segura utilizando la llave `service_role`.
* **Conclusión:** La seguridad de la base de datos a nivel de políticas está garantizada.

## 3. Prioridades Estratégicas (Enfoque Bootstrapping / Bajo Costo)
Ante la decisión de no consumir todavía la API pagada de Gemini para conservar capital, las prioridades sin costo que impactan directamente el producto son:
1. **Comprar y configurar un dominio:** Para habilitar Resend y que las empresas reciban correctamente los reclamos legales.
2. **Verificación Estricta de Empresa:** Asegurar el registro de compañías en el portal mediante emails corporativos para evitar suplantación de identidad.

## 4. Estrategia de Dominio y Marca (JustIA)
Se analizó la disponibilidad de dominios frente al problema de que la marca global estadounidense "Justia" ocupa la mayoría de las extensiones principales.

### Rankings de Dominio Seleccionados
1. **`appjustia.com` (~$11.00 USD/año fijo):** Recomendación principal. Combina el prestigio corporativo mundial del `.com` con una palabra clave ("app") que esquiva colisiones de marca. Costo de mantenimiento predecible y barato a largo plazo.
2. **`justia.help` (~$1.54 USD inicial, $26.26/año):** Opción ideal si se prioriza usar la marca exacta. "Help" transmite a la perfección la misión de la plataforma: resolución de disputas.
3. **`appjustia.app` (~$10.81 USD inicial, $14.93/año):** La opción de aspecto más tecnológico y moderno.

### Lección de Marca vs. Dominio vs. Razón Social
Se clarificó que en el ecosistema startup es el estándar de la industria tener el dominio desvinculado de la razón social y ligeramente alterado respecto a la marca:
* **Discord** (Razón Social: Hammer & Chisel / Dominio inicial: `discordapp.com`)
* **Dropbox** (Razón Social: Evenflow, Inc. / Dominio inicial: `getdropbox.com`)
* **JustIA** (Razón Social: *Por definir* / Dominio inicial: `appjustia.com`)

## 5. Próximos Pasos
* [ ] Adquirir el dominio seleccionado (Recomendación: Porkbun o Namecheap).
* [ ] Conectar los DNS del nuevo dominio con Vercel.
* [ ] Generar y configurar las llaves TXT/SPF/DKIM en el proveedor del dominio para validar el envío de correos en Resend.
* [ ] Actualizar las variables de entorno (`RESEND_FROM_EMAIL` y `NEXT_PUBLIC_APP_URL`).
