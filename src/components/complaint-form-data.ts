import type { ComplaintFormData } from "./complaint-form";

export interface IndustryCase extends ComplaintFormData {
  readonly label: string;
  readonly issueTag: string;
}

export interface IndustryGroup {
  readonly id: string;
  readonly emoji: string;
  readonly label: string;
  readonly subtitle: string;
  readonly stat: string;
  readonly cases: ReadonlyArray<IndustryCase>;
}

export const INDUSTRY_DRILLDOWN: ReadonlyArray<IndustryGroup> = [
  {
    id: "telecomunicaciones",
    emoji: "📡",
    label: "Telecomunicaciones",
    subtitle: "Internet, celular, TV",
    stat: "38% de reclamos MX",
    cases: [
      {
        label: "Cargos no reconocidos en factura",
        issueTag: "Cobros no autorizados",
        empresa: "Telcel",
        producto: "Plan Datos Ilimitados 30GB",
        moneda: "MXN",
        monto: "1200",
        categoria: "telecomunicaciones",
        canalCompra: "online",
        fechaCompra: "2026-01-10",
        problema:
          "Aparecieron cargos adicionales en mi factura por servicios que nunca contraté: seguro de teléfono $199 MXN y servicio de contenidos $99 MXN mensuales. Llevan 4 meses cobrándome sin mi autorización.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé al *264 en 3 ocasiones. Me dicen que fue una 'suscripción automática' pero no la autoricé. Levanté el folio de aclaración #TEL-2026-99821 sin resolución.",
        resolucionDeseada: ["reembolso", "cancelacion"],
      },
      {
        label: "Velocidad muy inferior a la contratada",
        issueTag: "Servicio deficiente",
        empresa: "Personal",
        producto: "Fibra óptica 100Mbps",
        moneda: "ARS",
        monto: "45000",
        categoria: "telecomunicaciones",
        canalCompra: "telefono",
        fechaCompra: "2026-01-15",
        problema:
          "Hace 3 meses que tengo cortes de internet diarios. La velocidad contratada es de 100Mbps pero nunca supera los 20Mbps. Llamé más de 10 veces sin solución.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé al 0800-345-1515 en 5 ocasiones. Folios #AR-2026-1234 y #AR-2026-5678. Un técnico vino pero el problema persiste. Pido la baja y quieren cobrar penalización.",
        resolucionDeseada: ["reembolso", "cancelacion"],
      },
      {
        label: "Suspensión de servicio con pago al corriente",
        issueTag: "Suspensión injusta",
        empresa: "Telmex",
        producto: "Internet Infinitum 50Mbps",
        moneda: "MXN",
        monto: "600",
        categoria: "telecomunicaciones",
        canalCompra: "local",
        fechaCompra: "2025-11-01",
        problema:
          "Suspendieron mi servicio de internet sin previo aviso alegando falta de pago, cuando tengo domiciliación bancaria activa y mi banco confirma que los cobros se realizaron correctamente.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la oficina Telmex de mi colonia. Me mostraron que el cargo sí fue procesado pero el sistema no lo registró. Llevan 3 semanas sin restablecer el servicio.",
        resolucionDeseada: ["cumplimiento"],
      },
      {
        label: "Servicios no contratados en factura",
        issueTag: "Cobros excesivos",
        empresa: "Claro",
        producto: "Plan Pospago 20GB",
        moneda: "ARS",
        monto: "32000",
        categoria: "telecomunicaciones",
        canalCompra: "local",
        fechaCompra: "2025-12-01",
        problema:
          "Me facturan servicios adicionales que nunca activé: roaming, seguro de equipo y un pack de entretenimiento. Ya son 3 meses consecutivos con estos cobros extras.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la sucursal y me dijeron que fue una 'promoción automática'. Hice el reclamo en el 611 con folio #CLR-888432 pero continúan los cobros.",
        resolucionDeseada: ["reembolso", "cancelacion"],
      },
    ],
  },
  {
    id: "servicios_financieros",
    emoji: "🏦",
    label: "Servicios Financieros",
    subtitle: "Bancos, tarjetas, seguros",
    stat: "29% de reclamos MX",
    cases: [
      {
        label: "Cargos no reconocidos sin investigación",
        issueTag: "Cargo fraudulento",
        empresa: "BBVA México",
        producto: "Tarjeta de crédito Visa Gold",
        moneda: "MXN",
        monto: "15000",
        categoria: "servicios_financieros",
        canalCompra: "local",
        fechaCompra: "2025-12-15",
        problema:
          "Aparecieron 3 cargos no reconocidos por compras en línea que nunca realicé. Me dijeron que la investigación tarda 45 días hábiles y que debo seguir pagando para no generar intereses.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé a BBVA y levanté folio #CLR-2026-44521. En sucursal me dijeron lo mismo. Ya pasaron 60 días sin resolución.",
        resolucionDeseada: ["reembolso", "compensacion"],
      },
      {
        label: "Fondos retenidos sin justificación",
        issueTag: "Fondos bloqueados",
        empresa: "Mercado Pago",
        producto: "Billetera digital / Cuenta",
        moneda: "ARS",
        monto: "120000",
        categoria: "servicios_financieros",
        canalCompra: "online",
        fechaCompra: "2026-02-01",
        problema:
          "Mercado Pago retuvo mis fondos ($120.000 ARS) sin ninguna explicación. Recibo el mensaje 'tu cuenta está en revisión' pero no me informan la causa ni el plazo de resolución.",
        contactoEmpresa: true,
        detalleContacto:
          "Abrí 4 tickets de soporte. Solo responden con mensajes automáticos. Escalaré a Defensa del Consumidor si no resuelven en 5 días hábiles.",
        resolucionDeseada: ["reembolso", "cumplimiento"],
      },
      {
        label: "Comisiones no informadas al contratar",
        issueTag: "Comisiones ocultas",
        empresa: "Banco Santander",
        producto: "Cuenta corriente",
        moneda: "ARS",
        monto: "85000",
        categoria: "servicios_financieros",
        canalCompra: "local",
        fechaCompra: "2025-10-01",
        problema:
          "Al momento de abrir mi cuenta me informaron que era 'sin costo de mantenimiento', pero desde el segundo mes me descuentan $8.500 mensuales sin haberme notificado el cambio en las condiciones.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la sucursal y el empleado me dijo que las condiciones cambiaron y que estaba 'en el contrato'. Nunca recibí notificación del cambio. Solicité la devolución y me la negaron.",
        resolucionDeseada: ["reembolso"],
      },
      {
        label: "Cuenta bloqueada sin explicación",
        issueTag: "Bloqueo injustificado",
        empresa: "Nu (Nubank)",
        producto: "Tarjeta de crédito Nu",
        moneda: "MXN",
        monto: "8000",
        categoria: "servicios_financieros",
        canalCompra: "online",
        fechaCompra: "2026-03-10",
        problema:
          "Bloquearon mi cuenta y tarjeta sin ningún aviso ni explicación. No puedo acceder a mis fondos ni usar la tarjeta. La app solo muestra 'tu cuenta está en revisión' sin más información.",
        contactoEmpresa: true,
        detalleContacto:
          "Contacté soporte por la app y por email. Solo respuestas automáticas. Pasaron 2 semanas sin acceso a mi dinero ni explicación.",
        resolucionDeseada: ["cumplimiento"],
      },
    ],
  },
  {
    id: "comercio_electronico",
    emoji: "🛒",
    label: "E-Commerce",
    subtitle: "Compras online, marketplaces",
    stat: "21% de reclamos AR",
    cases: [
      {
        label: "Llegó dañado y cierran el reclamo",
        issueTag: "Producto dañado",
        empresa: "MercadoLibre Argentina",
        producto: 'Notebook Lenovo IdeaPad 15.6" 512GB',
        moneda: "ARS",
        monto: "650000",
        categoria: "comercio_electronico",
        canalCompra: "online",
        fechaCompra: "2026-02-28",
        problema:
          "Compré una notebook marcada como 'nueva' pero llegó con caja abierta, rayones y batería que no supera 30 min de duración. El vendedor no responde y ML cerró mi reclamo diciendo que venció el plazo.",
        contactoEmpresa: true,
        detalleContacto:
          "Abrí reclamo el día que recibí el producto con fotos y video. Respuesta automática y caso cerrado a los 5 días sin solución.",
        resolucionDeseada: ["reembolso", "cambio"],
      },
      {
        label: "Compra no entregada tras semanas",
        issueTag: "No entregado",
        empresa: "Amazon México",
        producto: 'Smart TV Samsung 55" 4K',
        moneda: "MXN",
        monto: "12000",
        categoria: "comercio_electronico",
        canalCompra: "online",
        fechaCompra: "2026-03-05",
        problema:
          "La entrega prometida era en 2 días. Llevan 3 semanas sin entregar. El tracking dice 'en camino' desde hace 15 días. No me ofrecen reembolso ni fecha concreta de entrega.",
        contactoEmpresa: true,
        detalleContacto:
          "Contacté atención al cliente 3 veces por chat. Me dan fechas nuevas que no se cumplen. Solicité cancelación y me dijeron que debo esperar a que el producto sea devuelto al almacén primero.",
        resolucionDeseada: ["reembolso"],
      },
      {
        label: "Producto diferente al publicado",
        issueTag: "Publicidad engañosa",
        empresa: "Shein",
        producto: "Vestido talle M + 2 blusas",
        moneda: "MXN",
        monto: "1850",
        categoria: "comercio_electronico",
        canalCompra: "online",
        fechaCompra: "2026-03-01",
        problema:
          "Las prendas llegaron con colores completamente diferentes a los de las fotos y el talle M equivale a un S real. La plataforma no acepta devoluciones internacionales y solo ofrece un cupón del 20%.",
        contactoEmpresa: true,
        detalleContacto:
          "Abrí disputa en la app con fotos de comparación. Me ofrecieron el 30% de descuento en la próxima compra. No acepto ya que el producto no coincide con lo publicado.",
        resolucionDeseada: ["reembolso"],
      },
    ],
  },
  {
    id: "transporte",
    emoji: "✈️",
    label: "Transporte",
    subtitle: "Aerolíneas, colectivos",
    stat: "15% de reclamos MX",
    cases: [
      {
        label: "Vuelo cancelado sin reembolso",
        issueTag: "Vuelo cancelado",
        empresa: "Volaris",
        producto: "Vuelo CDMX → Cancún (2 pasajeros)",
        moneda: "MXN",
        monto: "8500",
        categoria: "transporte",
        canalCompra: "online",
        fechaCompra: "2026-03-01",
        problema:
          "Cancelaron mi vuelo 4 horas antes sin opciones de reubicación. Tuve que comprar boletos de última hora por el triple del precio. Solo ofrecen cupón de $2.000 MXN que no cubre ni el 25% de mi gasto.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé al centro de atención de Volaris. Me tuvieron en espera 2 horas. No me reubicaron en otro vuelo ni me reembolsaron los boletos.",
        resolucionDeseada: ["reembolso", "compensacion"],
      },
      {
        label: "Cambio de vuelo sin notificación",
        issueTag: "Cambio sin aviso",
        empresa: "Aerolíneas Argentinas",
        producto: "Vuelo BUE → Miami (1 pasajero)",
        moneda: "ARS",
        monto: "980000",
        categoria: "transporte",
        canalCompra: "online",
        fechaCompra: "2025-11-20",
        problema:
          "Cambiaron la fecha de mi vuelo unilateralmente de diciembre a febrero sin avisarme. Me enteré revisando mi reserva. Perdí el hotel y actividades pagadas por adelantado.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé al 0810-222-8627. Me dijeron que el cambio se notificó por email pero nunca llegó. Me ofrecieron cambio de fecha o crédito, pero no cubren los gastos que ya perdí.",
        resolucionDeseada: ["reembolso", "compensacion"],
      },
      {
        label: "Maleta perdida sin compensación",
        issueTag: "Equipaje perdido",
        empresa: "LATAM",
        producto: "Equipaje en bodega BUE-LIM",
        moneda: "ARS",
        monto: "450000",
        categoria: "transporte",
        canalCompra: "online",
        fechaCompra: "2026-01-08",
        problema:
          "Perdieron mi maleta en vuelo Buenos Aires-Lima. Llevo 3 semanas sin noticias. El sistema de reclamos online no me da actualizaciones y cuando llamo me dan respuestas contradictorias.",
        contactoEmpresa: true,
        detalleContacto:
          "Hice el reclamo PIR en el aeropuerto (folio LIMLAT12345). Llamé 6 veces al call center. Cada agente me da información diferente. No me ofrecen compensación por los artículos de primera necesidad que tuve que comprar.",
        resolucionDeseada: ["reembolso", "compensacion"],
      },
    ],
  },
  {
    id: "electrodomesticos",
    emoji: "🏠",
    label: "Electrodomésticos",
    subtitle: "Heladeras, lavarropas, TV",
    stat: "12% de reclamos AR",
    cases: [
      {
        label: "Defecto de fábrica — garantía ignorada",
        issueTag: "Garantía no honrada",
        empresa: "Fravega",
        producto: "Lavarropas automático Samsung 10kg",
        moneda: "ARS",
        monto: "420000",
        categoria: "electrodomesticos",
        canalCompra: "online",
        fechaCompra: "2026-02-10",
        problema:
          "El lavarropas dejó de centrifugar a las 3 semanas de uso. El servicio técnico dijo que era defecto de fábrica y que pedirían el repuesto. Pasaron 2 meses sin respuesta ni fecha de reparación.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la sucursal y me dijeron que era tema del servicio técnico. El ST dice que es tema de Fravega. Nadie se hace cargo. Folio de reclamo #FRV-2026-8821.",
        resolucionDeseada: ["cambio", "reparacion"],
      },
      {
        label: "Llegó golpeado — Liverpool y LG se echan la culpa",
        issueTag: "Entrega con daño",
        empresa: "Liverpool",
        producto: "Refrigerador LG 20 pies No Frost",
        moneda: "MXN",
        monto: "22000",
        categoria: "electrodomesticos",
        canalCompra: "local",
        fechaCompra: "2025-12-10",
        problema:
          "La entrega se retrasó 6 semanas. Cuando llegó, el refrigerador tenía un golpe lateral visible y el congelador no enfría correctamente. Liverpool dice que el daño fue en mi domicilio y no se hacen responsables.",
        contactoEmpresa: true,
        detalleContacto:
          "Levanté reporte el mismo día de la entrega con fotos. El ejecutivo de Liverpool dice que debo tramitar garantía con LG directamente. LG dice que es responsabilidad de la tienda.",
        resolucionDeseada: ["cambio"],
      },
      {
        label: "No funcionó desde el primer día",
        issueTag: "Defecto de fábrica",
        empresa: "Elektra",
        producto: 'Smart TV Hisense 55" 4K',
        moneda: "MXN",
        monto: "9500",
        categoria: "electrodomesticos",
        canalCompra: "local",
        fechaCompra: "2026-02-20",
        problema:
          "El televisor no encendió desde el primer día. Lo devolví a la tienda y me dijeron que primero deben enviarlo al servicio técnico. Llevan 5 semanas con el TV y no me dan fecha de devolución ni ofrecen cambio.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la sucursal con la factura el día siguiente de la compra. Me negaron el cambio inmediato. Me dieron folio de reparación #ELK-2026-55123 pero no hay actualizaciones.",
        resolucionDeseada: ["cambio"],
      },
    ],
  },
  {
    id: "salud",
    emoji: "🏥",
    label: "Salud",
    subtitle: "Prepagas, farmacias, clínicas",
    stat: "9% de reclamos AR",
    cases: [
      {
        label: "Rechazan práctica médica prescripta",
        issueTag: "Cobertura rechazada",
        empresa: "OSDE",
        producto: "Plan 310 Prepaga Médica",
        moneda: "ARS",
        monto: "280000",
        categoria: "salud",
        canalCompra: "local",
        fechaCompra: "2025-09-01",
        problema:
          "Me rechazan la cobertura de una resonancia magnética prescripta por mi médico neurólogo. Dicen que requiere 'autorización previa' pero llevan 3 semanas sin responder la solicitud de autorización.",
        contactoEmpresa: true,
        detalleContacto:
          "Envié la prescripción médica por la app y por email. Fui a la sede y me derivaron al centro de autorizaciones. Nadie resuelve. Tuve que pagar la resonancia de bolsillo: $280.000.",
        resolucionDeseada: ["reembolso", "cumplimiento"],
      },
      {
        label: "Niegan reembolso de hospitalización de emergencia",
        issueTag: "Reembolso negado",
        empresa: "GNP Seguros",
        producto: "Seguro de Gastos Médicos Mayor",
        moneda: "MXN",
        monto: "35000",
        categoria: "salud",
        canalCompra: "telefono",
        fechaCompra: "2025-08-15",
        problema:
          "Fui hospitalizado 3 días por apendicitis, situación cubierta en mi póliza. GNP se niega a reembolsar los $35.000 MXN del hospital alegando que 'la hospitalización no cumplió con el proceso de notificación previa', pero la cirugía fue de emergencia.",
        contactoEmpresa: true,
        detalleContacto:
          "El hospital notificó a GNP durante la hospitalización. Tengo el número de folio de notificación. GNP dice que la notificación llegó 'fuera de tiempo'. Presenté apelación formal sin respuesta.",
        resolucionDeseada: ["reembolso"],
      },
    ],
  },
  {
    id: "turismo",
    emoji: "🏨",
    label: "Turismo",
    subtitle: "Hoteles, paquetes, Airbnb",
    stat: "7% de reclamos MX",
    cases: [
      {
        label: "Pagué — el hotel no tenía reserva",
        issueTag: "Reserva fantasma",
        empresa: "Booking.com",
        producto: "Hotel Camino Real CDMX — 3 noches",
        moneda: "MXN",
        monto: "4500",
        categoria: "turismo",
        canalCompra: "online",
        fechaCompra: "2026-02-14",
        problema:
          "Booking cobró las 3 noches pero al llegar al hotel me dijeron que no tenían ninguna reserva a mi nombre. Tuve que buscar otro hotel de urgencia pagando el doble. Booking no me reembolsa diciendo que el cargo fue 'exitoso'.",
        contactoEmpresa: true,
        detalleContacto:
          "Contacté a Booking por chat y teléfono desde el hotel. Me pusieron en espera y luego me dijeron que investigarán en 7 días hábiles. Llevo 3 semanas sin reembolso.",
        resolucionDeseada: ["reembolso", "compensacion"],
      },
      {
        label: "Cancelaron el paquete y no devuelven el dinero",
        issueTag: "Cancelación sin devolución",
        empresa: "Despegar",
        producto: "Paquete vacacional Cancún 7 noches",
        moneda: "ARS",
        monto: "750000",
        categoria: "turismo",
        canalCompra: "online",
        fechaCompra: "2026-01-20",
        problema:
          "Despegar canceló mi paquete 15 días antes del viaje por 'problemas con el proveedor'. Me ofrecen un crédito para futuras compras pero no el reembolso en efectivo de los $750.000 que pagué.",
        contactoEmpresa: true,
        detalleContacto:
          "Llamé al 0810-333-3737 varias veces. Me insisten en que el crédito es la única opción. No acepto porque no tengo planes de viajar próximamente y necesito el dinero.",
        resolucionDeseada: ["reembolso"],
      },
    ],
  },
  {
    id: "retail",
    emoji: "🛍️",
    label: "Retail",
    subtitle: "Tiendas, supermercados, ropa",
    stat: "5% de reclamos",
    cases: [
      {
        label: "Cobraron más del precio publicado",
        issueTag: "Precio engañoso",
        empresa: "Coppel",
        producto: 'Televisor Samsung 50" Smart TV',
        moneda: "MXN",
        monto: "11000",
        categoria: "electronica",
        canalCompra: "local",
        fechaCompra: "2026-03-15",
        problema:
          "El precio publicado en la web era $8.500 MXN pero en caja me cobraron $11.000. Me dijeron que el precio web 'no aplica en tienda física' aunque el anuncio no lo especificaba claramente.",
        contactoEmpresa: true,
        detalleContacto:
          "Hablé con el gerente de la tienda. Dijo que es política interna y no hay nada que hacer. Tomé foto del precio publicado en pantalla en tienda que coincidía con el precio web.",
        resolucionDeseada: ["reembolso"],
      },
      {
        label: "Niegan cambio de talle dentro del plazo legal",
        issueTag: "Devolución rechazada",
        empresa: "Falabella",
        producto: "Zapatillas Nike Air Max 90",
        moneda: "ARS",
        monto: "95000",
        categoria: "indumentaria",
        canalCompra: "local",
        fechaCompra: "2026-03-01",
        problema:
          "Quiero cambiar las zapatillas por talle correcto a 12 días de la compra (dentro del plazo legal de 30 días) y me lo niegan diciendo que 'ya fueron usadas' cuando solo las probé en casa.",
        contactoEmpresa: true,
        detalleContacto:
          "Fui a la sucursal con ticket y zapatillas. La vendedora llamó al supervisor que también lo negó. La Ley 24.240 garantiza el cambio dentro de los 30 días.",
        resolucionDeseada: ["cambio"],
      },
    ],
  },
];
