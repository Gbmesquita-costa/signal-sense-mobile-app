export default {
  // App
  appName: "SignalSense",

  // Tabs
  tabs: {
    scan: "Escaneo",
    proximity: "Proximidad",
    environment: "Ambiente",
    wifi: "Wi-Fi",
    education: "Educación",
  },

  // Settings
  settings: {
    title: "Configuración",

    // Theme section
    theme: {
      title: "Tema",
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
    },

    // Language section
    language: {
      title: "Idioma",
    },

    // About section
    about: {
      title: "Acerca de",
      description:
        "SignalSense es una herramienta de privacidad personal que te ayuda a detectar señales de dispositivos a tu alrededor. No hacemos promesas absolutas — ofrecemos conciencia.",
    },

    // Premium section
    premium: {
      title: "Premium",
      active: "Premium activo",
      upgrade: "Desbloquear Premium",
    },

    // Export section
    export: {
      title: "Exportar Datos",
    },

    // Anti-Stalking section
    antiStalking: {
      title: "Anti-Rastreo",
      enable: "Activar Monitoreo",
      enableDesc: "Escanea rastreadores en segundo plano",
      trustedDevices: "Dispositivos de Confianza",
      trustedDevicesDesc:
        "Los dispositivos que marcaste como seguros no activan alertas.",
      noTrustedDevices: "Ningún dispositivo de confianza aún.",
    },

    // Privacy section
    privacy: {
      title: "Privacidad",
      content:
        "Tu privacidad es nuestra prioridad. SignalSense:\n\n• No recopila ningún dato personal\n• No tiene backend ni servidor\n• Todo el procesamiento ocurre localmente en tu dispositivo\n• No rastrea tu ubicación\n• No comparte información con terceros",
    },
  },

  // Scan screen
  scan: {
    title: "Escaneo de Señales",
    tapToStart: "Toca para iniciar el escaneo",
    description: "Detecta dispositivos Bluetooth a tu alrededor",
    scanning: "Escaneando...",
    disclaimer: "Solo detectamos señales activas. No se recopilan datos.",
    error: "Error",
    retry: "Reintentar",
    settings: "Configuración",
    signalStrength: {
      weak: "Débil",
      medium: "Medio",
      strong: "Fuerte",
    },
    states: {
      checking: "Verificando...",
      checkingPermissions: "Verificando permisos...",
      requestingPermissions: "Solicitando permisos...",
      checkingBluetooth: "Verificando Bluetooth...",
      initializing: "Inicializando sensores...",
      scanning: "Buscando dispositivos...",
      foundDevices: "{count} dispositivo(s) encontrado(s)",
      finished: "{count} dispositivo(s) encontrado(s)",
      error: "Ocurrió un error",
      loadingMore: "Cargando más...",
      searchingDevices: "Buscando dispositivos...",
    },
    errorMessages: {
      bluetoothOff:
        "Bluetooth está desactivado. Activa el Bluetooth para continuar.",
      locationOff:
        "La ubicación está desactivada. Activa la ubicación para continuar.",
    },
  },

  // Proximity screen
  proximity: {
    // Estado vacío
    empty: {
      title: "Ningún Dispositivo Seleccionado",
      message:
        "Ve a Escanear y selecciona un dispositivo para monitorear su proximidad.",
      button: "Ir a Escanear",
    },

    // Estado listo
    ready: {
      message:
        "Toca el botón de abajo para iniciar el monitoreo de proximidad.",
    },

    // Botones
    startMonitoring: "Iniciar Monitoreo",
    monitoringLoading: "Inicializando monitoreo...",
    stopMonitoring: "Detener Monitoreo",
    changeDevice: "Cambiar Dispositivo",

    // Señal perdida
    signalLost: {
      title: "Señal Perdida",
      message:
        "El dispositivo ya no responde. Puede estar fuera de alcance o apagado.",
      retry: "Intentar de Nuevo",
      newScan: "Nuevo Escaneo",
    },

    // Niveles de proximidad
    levels: {
      near: "Muy Cerca",
      medium: "Distancia Media",
      far: "Lejos",
      unknown: "Desconocido",
    },

    // Distancia
    distance: {
      estimated: "Distancia Estimada",
      real: "Distancia Real",
      precise: "PRECISO",
    },

    // RSSI
    rssi: {
      raw: "RSSI bruto",
    },

    // Errores de permisos/servicios
    errors: {
      bluetoothOff: {
        title: "Bluetooth Desactivado",
        message:
          "El Bluetooth debe estar activado para monitorear este dispositivo.",
      },
      locationOff: {
        title: "Ubicación Desactivada",
        message:
          "La ubicación debe estar activada para monitorear dispositivos.",
      },
      generic: {
        title: "Error de Monitoreo",
        message: "Ocurrió un error al intentar iniciar el monitoreo.",
      },
      openSettings: "Abrir Configuración",
    },
  },

  // Environment screen
  environment: {
    // Idle
    idle: {
      initializingSensor: "Inicializando sensor...",
      tapToStart: "Toca para iniciar",
      description:
        "El magnetómetro detectará variaciones en el campo magnético a tu alrededor",
      hint: "El campo magnético normal de la Tierra es de 25-65 µT.\nValores elevados pueden indicar interferencia de objetos metálicos, motores o dispositivos electrónicos cercanos.",
    },

    // Estados
    initializing: "Inicializando magnetómetro...",
    stopMonitoring: "Detener Monitoreo",

    // Labels
    statusLabel: "ESTADO DEL AMBIENTE",
    axis: "Eje",

    // Status
    status: {
      stable: "Ambiente Estable",
      moderate: "Interferencia Moderada",
      high: "Campo Magnético Elevado",
      extreme: "Fuerte Interferencia",
    },

    // Sensor no disponible
    unavailable: {
      title: "Sensor No Disponible",
      message: "Tu dispositivo no tiene un magnetómetro o no está accesible.",
    },

    // Error
    error: {
      title: "Error al Acceder al Sensor",
    },

    // Consejo educativo
    tip: "Las variaciones en el campo magnético pueden ser causadas por objetos metálicos, motores, altavoces o dispositivos electrónicos cercanos. Los valores elevados no significan necesariamente peligro.",
  },

  // Education screen
  education: {
    title: "Educación",
    subtitle: "Entiende cómo funciona la app y qué significa cada medición.",
    tip: "Consejo",
    disclaimer:
      "No hacemos promesas absolutas sobre detección o medición. Usa con conciencia.",

    // Topics
    topics: {
      // 1. Introduction
      intro: {
        title: "¿Qué es SignalSense?",
        description: "Conoce la app y entiende qué hace — y qué no hace.",
        sections: [
          {
            title: "Visión General",
            content:
              "SignalSense es una herramienta que analiza señales de radio (Bluetooth) y campos magnéticos para ayudarte a entender tu entorno. Transforma datos técnicos en información comprensible.",
          },
          {
            title: "Lo que hace",
            content:
              "• Detecta dispositivos que emiten señales Bluetooth (BLE)\n• Estima la proximidad de dispositivos seleccionados\n• Monitorea variaciones en el campo magnético ambiental\n• Registra un historial completo de sesiones\n• Identifica posibles rastreadores (AirTag, Tile, etc.)\n• Permite nombrar y gestionar perfiles de dispositivos\n• Presenta los datos de forma visual y educativa",
          },
          {
            title: "Lo que NO hace",
            content:
              "• No detecta dispositivos apagados u ocultos sin señal\n• No es un detector de metales\n• No puede ver a través de paredes con precisión\n• No identifica personas u objetos específicos\n• No sustituye equipos profesionales de seguridad\n• No detecta Bluetooth Clásico (solo BLE)",
          },
        ],
        tip: "Usa SignalSense como una herramienta de concientización, no como un dispositivo de seguridad absoluto.",
      },

      // 2. Scan
      scan: {
        title: "Cómo funciona el Escaneo",
        description:
          "Entiende cómo el escaneo de señales detecta dispositivos a tu alrededor.",
        sections: [
          {
            title: "Bluetooth Low Energy (BLE)",
            content:
              "El Escaneo detecta dispositivos que están emitiendo activamente señales BLE (Bluetooth Low Energy). Bluetooth es usado por audífonos, relojes, bocinas, rastreadores y dispositivos inteligentes. Los dispositivos Bluetooth Clásico (como algunos audífonos antiguos) no son detectables por el escaneo.",
          },
          {
            title: "Qué significa 'dispositivo encontrado'",
            content:
              "Cuando un dispositivo aparece en la lista, significa que está emitiendo una señal que tu teléfono pudo captar. Esto NO significa necesariamente que está cerca — las señales pueden atravesar paredes y viajar decenas de metros.",
          },
          {
            title: "Interacciones en la lista de dispositivos",
            content:
              "• Toque rápido: selecciona el dispositivo para monitorear en Proximidad\n• Toque largo (mantener presionado): abre el perfil completo del dispositivo con historial de sesiones, nombre personalizado y detalles técnicos\n• Barras de señal: muestran la fuerza del RSSI en tiempo real\n• Insignia de rastreador: aparece cuando el dispositivo es identificado como posible rastreador",
          },
          {
            title: "Filtros avanzados (Premium)",
            content:
              "• Búsqueda por nombre: busca dispositivos por nombre o nombre personalizado\n• Filtro por señal: Fuerte (≥ -60 dBm), Medio (-60 a -80 dBm), Débil (< -80 dBm)\n• Solo rastreadores: muestra solo dispositivos identificados como rastreadores\n• Solo nombrados: muestra solo dispositivos con nombre personalizado\n• Ordenación: por señal (RSSI), por nombre o por última detección",
          },
          {
            title: "Por qué los resultados varían",
            content:
              "• Paredes y obstáculos atenúan la señal\n• Otros dispositivos pueden causar interferencia\n• Algunos dispositivos emiten señales intermitentes\n• La orientación del teléfono afecta la recepción\n• Materiales metálicos reflejan señales",
          },
          {
            title: "Cómo funciona Bluetooth",
            content:
              "• El escaneo procesa dispositivos en lotes cada 100ms\n• Cada dispositivo se actualiza como máximo cada 500ms para evitar sobrecarga\n• Los dispositivos BLE emiten señales periódicas (advertisements)\n• El alcance típico es de 10-30 metros en interiores\n• La fuerza de la señal disminuye con la distancia y los obstáculos",
          },
        ],
        tip: "Dispositivos que no aparecen pueden estar apagados, en modo avión, o simplemente fuera de alcance. Mantén presionado un dispositivo para ver su perfil completo.",
      },

      // 3. Proximity
      proximity: {
        title: "Cómo funciona Proximidad",
        description:
          "Aprende cómo la app estima la distancia a un dispositivo.",
        sections: [
          {
            title: "Qué es RSSI",
            content:
              "RSSI (Indicador de Intensidad de Señal Recibida) es la medida de la fuerza de la señal recibida, en dBm. Valores más cercanos a 0 indican señal más fuerte. Ej: -30 dBm es muy fuerte, -90 dBm es muy débil.",
          },
          {
            title: "Estimación de distancia",
            content:
              "La app usa el modelo de Friis (propagación de señales) para convertir RSSI en distancia estimada. La fórmula considera la potencia de transmisión (TX Power), el factor ambiental (2.0 a 4.0) y aplica calibración automática basada en el historial de muestras.",
          },
          {
            title: "Cómo la app estabiliza los valores",
            content:
              "La app usa múltiples técnicas para suavizar la distancia:\n• Suavizado EMA (Media Móvil Exponencial) en RSSI con factor 0.3 — se preserva el 70% del valor anterior\n• Calibración de TX Power via mediana de las últimas 30 muestras, recalibrada cada 30 nuevas muestras\n• Factor ambiental con transición suave (sin saltos abruptos)\n• Suavizado final en la distancia (EMA 0.2)\n• La UI se actualiza cada 300ms, alineada con las animaciones",
          },
          {
            title: "Niveles de proximidad",
            content:
              "• Cerca (RSSI ≥ -60 dBm): dispositivo probablemente a menos de 2 metros\n• Medio (RSSI entre -60 y -80 dBm): dispositivo a varios metros de distancia\n• Lejos (RSSI < -80 dBm): dispositivo distante o con obstáculos\n• Si el dispositivo no responde por 5 segundos, la señal se considera perdida",
          },
          {
            title: "Por qué la distancia varía incluso sin moverse",
            content:
              "Incluso con el teléfono estático, el RSSI varía naturalmente ±2-5 dBm debido a reflexiones e interferencia ambiental. Como la fórmula de distancia es exponencial, pequeñas variaciones de RSSI causan cambios mayores en la distancia. La app minimiza esto con suavizado, pero variaciones leves son normales y esperadas.",
          },
          {
            title: "Gráfico RSSI (Premium)",
            content:
              "El gráfico en tiempo real muestra la variación del RSSI a lo largo del tiempo, con hasta 80 muestras visibles. Incluye estadísticas de RSSI actual, mínimo y máximo. Útil para identificar patrones de señal y probar posicionamiento.",
          },
        ],
        tip: "Trata la distancia estimada como una referencia aproximada. Para mejores resultados, mantén el teléfono quieto y sin obstrucciones entre él y el dispositivo.",
      },

      // 4. Environment
      environment: {
        title: "Cómo funciona Ambiente",
        description:
          "Entiende qué mide el magnetómetro y qué significan los valores.",
        sections: [
          {
            title: "Qué es el Magnetómetro",
            content:
              "El magnetómetro es un sensor presente en la mayoría de los smartphones que mide campos magnéticos en microteslas (µT). Se usa en brújulas digitales y apps de navegación.",
          },
          {
            title: "Campo magnético normal",
            content:
              "El campo magnético de la Tierra varía entre 25-65 µT dependiendo de la ubicación. Valores estables en este rango indican un ambiente sin interferencias significativas.",
          },
          {
            title: "Qué causa variaciones",
            content:
              "• Objetos metálicos (muebles, estructuras)\n• Imanes y bocinas\n• Motores eléctricos\n• Cables de alta tensión\n• Dispositivos electrónicos encendidos",
          },
          {
            title: "Qué significan los niveles",
            content:
              "La app usa histéresis para evitar oscilación en los límites:\n• Estable: debajo de 70 µT (vuelve a estable debajo de 55 µT)\n• Moderado: entre 55-150 µT (cambia a elevado arriba de 150 µT)\n• Elevado: entre 120-400 µT (cambia a extremo arriba de 400 µT)\n• Extremo: arriba de 400 µT (vuelve a elevado debajo de 330 µT)",
          },
          {
            title: "Cómo funciona el monitoreo",
            content:
              "• El sensor se actualiza a ~30 FPS (cada 33ms)\n• Suavizado EMA con factor 0.3 para evitar micro-temblores\n• Los valores X, Y y Z se animan directamente en la UI (60 FPS) sin re-renders\n• La retroalimentación háptica vibra cuando el nivel aumenta, con intervalo mínimo de 800ms\n• El estado visual se actualiza como máximo 2x por segundo para evitar parpadeos",
          },
        ],
        tip: "Valores altos no significan peligro — solo indican la presencia de fuentes magnéticas cercanas. Mueve el teléfono lentamente para mapear la fuente.",
      },

      // 5. History
      history: {
        title: "Historial de Sesiones",
        description:
          "Entiende cómo la app registra y organiza tus sesiones de monitoreo.",
        sections: [
          {
            title: "Qué se registra",
            content:
              "Cada vez que haces un escaneo, monitoreas la proximidad de un dispositivo, o usas el sensor de ambiente, la app crea una sesión en el historial. Cada sesión registra: hora de inicio y fin, duración, tipo de sesión y datos relevantes.",
          },
          {
            title: "Tipos de sesión",
            content:
              "• Scan BLE: registra todos los dispositivos encontrados, con estadísticas de RSSI (mínimo, máximo, promedio) de cada uno\n• Proximidad: registra el monitoreo de un dispositivo específico, con muestras de RSSI y distancia estimada\n• Ambiente: registra lecturas del magnetómetro (X, Y, Z, magnitud y estado) a lo largo del tiempo",
          },
          {
            title: "Filtros del historial",
            content:
              "Usa los chips en la parte superior de la pantalla para filtrar por tipo:\n• Todos: muestra todas las sesiones\n• Scan: solo sesiones de escaneo BLE\n• Proximidad: solo sesiones de monitoreo de proximidad\n• Ambiente: solo sesiones del magnetómetro",
          },
          {
            title: "Gestión de sesiones",
            content:
              "• Desliza una sesión hacia la izquierda para eliminarla\n• Las sesiones se agrupan por fecha (Hoy, Ayer, o la fecha completa)\n• Duración y cantidad de dispositivos se muestran en cada tarjeta\n• Desliza hacia abajo para actualizar la lista",
          },
          {
            title: "Límite gratuito",
            content:
              "Los usuarios gratuitos pueden ver las últimas 3 sesiones. Para acceder al historial completo e ilimitado, se requiere el plan Premium.",
          },
        ],
        tip: "El historial se guarda localmente en tu dispositivo. Las sesiones solo se crean cuando el monitoreo realmente comienza a recibir datos — si cancelas durante la carga, no se crea ninguna sesión vacía.",
      },

      // 6. Device Profiles
      deviceProfiles: {
        title: "Perfiles de Dispositivos",
        description:
          "Aprende cómo gestionar dispositivos detectados y personalizar sus nombres.",
        sections: [
          {
            title: "Qué es un perfil de dispositivo",
            content:
              "Cada dispositivo Bluetooth detectado por la app obtiene automáticamente un perfil. El perfil almacena: ID Bluetooth, nombre original (si disponible), nombre personalizado, primera y última detección, cantidad de apariciones y si es un posible rastreador.",
          },
          {
            title: "Cómo acceder al perfil",
            content:
              "En la pantalla de Escaneo, mantén presionado (toque largo) cualquier dispositivo de la lista para abrir su perfil completo. El perfil es una funcionalidad Premium.",
          },
          {
            title: "Nombre personalizado",
            content:
              "• Toca el ícono de edición junto al nombre para definir un nombre personalizado\n• El nombre personalizado aparece en todas las pantallas de la app (Escaneo, Proximidad, Historial)\n• Máximo 30 caracteres\n• Para eliminar el nombre personalizado, toca la X junto al nombre",
          },
          {
            title: "Descubrimiento de nombre via GATT",
            content:
              "Si un dispositivo no tiene nombre visible, puedes intentar descubrirlo. La app prueba múltiples estrategias:\n• Caché del sistema BLE (sin conexión)\n• Conexión directa y lectura GATT\n• Fallback con autoConnect en Android\n\nNota: dispositivos Bluetooth Clásico (no-BLE) pueden no responder. En ese caso, usa un nombre personalizado.",
          },
          {
            title: "Historial de apariciones",
            content:
              "El perfil muestra todas las sesiones de escaneo en las que el dispositivo fue detectado, con fecha, duración, cantidad de dispositivos en la sesión y estadísticas de RSSI (promedio). Funcionalidad exclusiva Premium.",
          },
        ],
        tip: "Usa nombres personalizados para identificar fácilmente tus dispositivos conocidos. El nombre aparece en toda la app.",
      },

      // 7. Premium
      premium: {
        title: "Plan Premium",
        description:
          "Conoce las funcionalidades exclusivas y lo que ofrece el plan gratuito.",
        sections: [
          {
            title: "Qué es gratuito",
            content:
              "• Escaneo BLE completo e ilimitado\n• Monitoreo de proximidad (distancia y nivel)\n• Monitoreo del campo magnético (ambiente)\n• Hasta 3 sesiones en el historial\n• Pestaña de educación completa\n• Temas claro y oscuro",
          },
          {
            title: "Qué desbloquea Premium",
            content:
              "• Historial ilimitado de sesiones\n• Perfiles de dispositivos (toque largo en el escaneo)\n• Detección de rastreadores (AirTag, Tile, SmartTag, etc.)\n• Gráfico RSSI en tiempo real en Proximidad\n• Exportación de datos como CSV\n• Filtros avanzados en Escaneo (búsqueda, señal, rastreadores, nombrados, ordenación)",
          },
          {
            title: "Cómo funciona la compra",
            content:
              "Premium es una compra única — sin suscripción, sin cobros recurrentes. Una vez comprado, es tuyo para siempre. La compra se procesa a través de Google Play.",
          },
          {
            title: "Restaurar compra",
            content:
              "Si cambias de celular, reinstalas la app o formateas el dispositivo, tu compra no se pierde. Google guarda el registro de tu compra vinculado a tu cuenta Google.\n\nSolo toca 'Restaurar compra anterior' en la pantalla Premium — la app consulta la tienda, confirma que ya pagaste y desbloquea Premium nuevamente. Sin costo adicional.",
          },
          {
            title: "Precio regional",
            content:
              "El precio de Premium se ajusta automáticamente para tu región. Si estás en México, el valor aparece en pesos (MXN); en Argentina, en pesos argentinos — adaptado al mercado local.\n\nEsto lo hace directamente Google Play — garantizando un precio justo y accesible independientemente del país.",
          },
        ],
        tip: "El plan gratuito ya ofrece todas las funcionalidades principales. Premium es para quienes quieren el máximo de la app.",
      },

      // 8. Anti-Stalking
      antiStalking: {
        title: "Protección Anti-Rastreo",
        description:
          "Aprende cómo la app ayuda a detectar dispositivos Bluetooth que pueden estar siguiéndote.",
        sections: [
          {
            title: "¿Qué es el Anti-Rastreo?",
            content:
              "La funcionalidad anti-rastreo monitorea todos los dispositivos Bluetooth (BLE) a tu alrededor — no solo rastreadores conocidos como AirTags o Tiles, sino cualquier dispositivo que parezca estar moviéndose contigo a lo largo del tiempo. Si un dispositivo es detectado cerca de ti consistentemente por 15+ minutos, recibes una alerta. Este enfoque más amplio asegura que incluso dispositivos improvisados o menos conocidos sean detectados.",
          },
          {
            title: "Cómo funciona la detección",
            content:
              "La app escanea periódicamente todos los dispositivos BLE en rango. Los rastreadores conocidos (AirTag, Tile, SmartTag, etc.) se identifican con mayor confianza, mientras que dispositivos desconocidos se rastrean con menor confianza. Si cualquier dispositivo persiste más allá de la ventana de tiempo configurada (predeterminado 15 minutos) con un número mínimo de avistamientos, se marca como sospechoso.",
          },
          {
            title: "Monitoreo en segundo plano",
            content:
              "Cuando está activado, la app continúa escaneando incluso cuando está minimizada. Ejecuta ráfagas cortas de escaneo en segundo plano y envía una notificación push si se encuentra un dispositivo sospechoso. El escaneo en segundo plano usa batería mínima.",
          },
          {
            title: "Dispositivos de confianza",
            content:
              "Puedes marcar cualquier dispositivo como de confianza desde su pantalla de perfil para evitar falsas alertas. Por ejemplo, tus propios auriculares, un reloj inteligente o el AirTag de un familiar. Los dispositivos de confianza son permanentemente ignorados por el sistema de detección hasta que los elimines.",
          },
          {
            title: "Limitaciones",
            content:
              "• La detección depende de que los dispositivos estén emitiendo señales BLE activamente\n• Algunos dispositivos pueden rotar su dirección Bluetooth, dificultando el rastreo persistente\n• La frecuencia del escaneo en segundo plano depende de restricciones del sistema operativo\n• Monitorear todos los dispositivos puede generar más alertas — usa la función de confianza para reducir el ruido\n• Esta es una herramienta de concientización, no una garantía de seguridad\n• Si te sientes inseguro, contacta a las autoridades locales",
          },
        ],
        tip: "Mantén el anti-rastreo activado al viajar solo o en áreas desconocidas. Si recibes una alerta, revisa tus pertenencias y alrededores cuidadosamente. Puedes confiar en tus propios dispositivos desde su perfil para reducir falsas alertas.",
      },

      // 9. Wi-Fi Info
      wifiInfo: {
        title: "Información Wi-Fi",
        description:
          "Entiende cómo funciona el análisis Wi-Fi y qué información está disponible.",
        sections: [
          {
            title: "¿Qué es Wi-Fi Info?",
            content:
              "La función Wi-Fi Info te permite monitorear tu conexión Wi-Fi actual en tiempo real — incluyendo intensidad de señal, banda de frecuencia, dirección IP y más. Te ayuda a entender tu entorno de red de un vistazo.",
          },
          {
            title: "Calidad de señal",
            content:
              "La intensidad de señal se mide como porcentaje (0-100%). Excelente (80%+) significa conexión rápida y estable. Buena (60-79%) es confiable para la mayoría de tareas. Regular (40-59%) puede causar velocidades más lentas. Señal Débil o Mala puede provocar desconexiones.",
          },
          {
            title: "Bandas de frecuencia",
            content:
              "Wi-Fi opera en diferentes bandas de frecuencia:\n• 2.4 GHz — mayor alcance pero más lento, más interferencia\n• 5 GHz — velocidades más rápidas, menor alcance, menos congestión\n• 6 GHz — banda más nueva, velocidades más rápidas, menor alcance\n\nLa app muestra qué banda usa tu conexión.",
          },
          {
            title: "Escaneo de redes cercanas",
            content:
              "La versión premium puede escanear todas las redes Wi-Fi cercanas. Esto muestra la intensidad de señal (RSSI en dBm), canal, banda de frecuencia y tipo de seguridad de cada red. Es útil para encontrar canales menos congestionados.",
          },
          {
            title: "Análisis de canales",
            content:
              "Múltiples redes en el mismo canal causan interferencia. El gráfico de análisis de canales (premium) muestra cuántas redes ocupan cada canal, ayudándote a identificar el canal menos congestionado para tu router.",
          },
          {
            title: "Rastreador de Señal",
            content:
              "El Rastreador de Señal te permite localizar tu router rastreando la intensidad de la señal Wi-Fi en tiempo real. Cuenta con un radar animado que reacciona a los cambios de señal, una distancia estimada al router y una barra de progreso de intensidad de señal. Camina por tu casa y observa la señal actualizarse en vivo — cuanto más cerca estés del router, más fuerte será la señal. El gráfico de historial de señal (premium) muestra cómo varía la señal a lo largo del tiempo.",
          },
        ],
        tip: "Usa el Rastreador de Señal para encontrar el mejor lugar para tus dispositivos. Camina por la casa y observa el radar — cuando la señal sea más fuerte, estarás más cerca del router. Para la mejor experiencia, conéctate a una red de 5 GHz cuando estés cerca.",
      },

      // 10. Interference
      interference: {
        title: "Qué causa interferencia",
        description:
          "Conoce los factores que afectan las mediciones de señales y campos magnéticos.",
        sections: [
          {
            title: "Interferencia en señales de radio",
            content:
              "• Paredes (especialmente concreto y metal)\n• Agua (incluyendo el cuerpo humano)\n• Otros dispositivos en la misma frecuencia\n• Microondas y equipos industriales\n• Redes Wi-Fi congestionadas",
          },
          {
            title: "Interferencia magnética",
            content:
              "• Estructuras metálicas (vigas, portones)\n• Electrodomésticos (refrigerador, lavadora)\n• Electrónicos (computadoras, TVs)\n• Vehículos cercanos\n• Cables eléctricos en paredes",
          },
          {
            title: "Cómo minimizar interferencia",
            content:
              "• Aléjate de grandes estructuras metálicas\n• Evita medir cerca de electrodomésticos encendidos\n• Mantén tu teléfono alejado de otros dispositivos\n• Prueba en diferentes posiciones y orientaciones",
          },
        ],
      },

      // 9. Limitations
      limitations: {
        title: "Limitaciones de la App",
        description: "Es importante entender qué NO puede hacer SignalSense.",
        sections: [
          {
            title: "No es un GPS",
            content:
              "La app no usa GPS para localizar dispositivos. La estimación de distancia se basa solo en la fuerza de la señal de radio, que es mucho menos precisa.",
          },
          {
            title: "No puede ver a través de paredes",
            content:
              "Aunque las señales de radio atraviesan paredes, la atenuación causa imprecisiones significativas. No puedes determinar con certeza si un dispositivo está en el cuarto de al lado.",
          },
          {
            title: "No identifica personas u objetos",
            content:
              "La app detecta señales de dispositivos, no personas. Una señal Bluetooth podría ser de unos audífonos olvidados, no necesariamente de una persona.",
          },
          {
            title: "No es equipo profesional",
            content:
              "SignalSense usa los sensores de tu smartphone, que están diseñados para uso general. Los equipos profesionales de seguridad o medición son mucho más precisos y confiables.",
          },
          {
            title: "No detecta dispositivos apagados",
            content:
              "Si un dispositivo está apagado, en modo avión, o no emitiendo señales activamente, será invisible para el Escaneo. La app detecta solo Bluetooth Low Energy (BLE), no Bluetooth Clásico.",
          },
        ],
        tip: "Usa SignalSense para aprender y tener conciencia, no como herramienta de seguridad definitiva.",
      },

      // 10. Best Practices
      bestPractices: {
        title: "Buenas Prácticas",
        description:
          "Consejos para obtener los mejores resultados con SignalSense.",
        sections: [
          {
            title: "Posicionamiento del teléfono",
            content:
              "• Sostén el teléfono con la pantalla hacia arriba\n• Evita cubrir los bordes con tus manos\n• Mantén el teléfono relativamente quieto durante mediciones\n• La antena usualmente está en la parte inferior o superior",
          },
          {
            title: "Ambiente de prueba",
            content:
              "• Primero prueba en un lugar conocido y tranquilo\n• Compara resultados en diferentes ambientes\n• Recuerda que cada lugar tiene sus características\n• Haz múltiples mediciones para confirmar patrones",
          },
          {
            title: "Interpretación de datos",
            content:
              "• No saques conclusiones de una sola medición\n• Observa tendencias y patrones a lo largo del tiempo\n• Considera el contexto del ambiente\n• Recuerda las limitaciones técnicas",
          },
          {
            title: "Uso responsable",
            content:
              "• Usa la app para fines educativos y de concientización\n• Respeta la privacidad de otras personas\n• No uses para actividades ilegales o antiéticas\n• Comparte conocimiento de forma responsable",
          },
        ],
        tip: "La práctica y la experimentación son las mejores formas de entender cómo se comportan las señales en tu ambiente.",
      },
    },
  },

  // History
  history: {
    title: "Historial",
    device: "dispositivo",
    devices: "dispositivos",
    session: "sesión en total",
    sessions: "sesiones en total",
    showingLast: "mostrando últimas",
    empty: "No hay sesiones registradas aún. Haz un escaneo para comenzar.",
    premiumHint: "Desbloquea Premium para acceder a todo tu historial.",
    today: "Hoy",
    yesterday: "Ayer",
    duration: {
      seconds: "s",
      minutes: "min",
      hours: "h",
    },
    filterAll: "Todos",
    filterScan: "Scan",
    filterProximity: "Proximidad",
    filterEnvironment: "Ambiente",
    filterWifi: "Wi-Fi",
    sessionTypes: {
      scan: "Scan BLE",
      proximity: "Proximidad",
      environment: "Ambiente",
      wifi: "Wi-Fi",
    },
  },

  // Device Profile
  deviceProfile: {
    notFound: "Dispositivo no encontrado.",
    bleId: "ID Bluetooth",
    firstSeen: "Visto por primera vez",
    lastSeen: "Visto por última vez",
    appearances: "Apariciones",
    sessionHistory: "Historial de Sesiones",
    noSessions: "No hay sesiones registradas para este dispositivo.",
    signal: "Señal",
    resolveName: "Descubrir nombre",
    resolveNameHint:
      "Se conecta brevemente al dispositivo para obtener el nombre. Consume más energía.",
    resolveNameError:
      "No se pudo conectar al dispositivo. Verifique que esté encendido y cerca.",
    resolveNameTimeout:
      "No se pudo conectar. El dispositivo puede usar Bluetooth Clásico (ej: auriculares) que no soporta lectura de nombre por BLE. Intente nombrarlo manualmente.",
    resolveNameGattFailed:
      "Se conectó al dispositivo, pero no permitió la lectura de datos. Puede requerir emparejamiento.",
    resolveNameNotFound:
      "Se conectó al dispositivo, pero no comparte su nombre por ningún método BLE conocido.",
    editName: "Editar nombre",
    editNamePlaceholder: "Nombre del dispositivo",
    editNameSave: "Guardar",
    editNameClear: "Quitar nombre",
    editNameLimitReached: "Límite de caracteres alcanzado.",
    editNameNoMultipleSpaces: "Espacios consecutivos no permitidos.",
    editNameNoLeadingSpace: "El nombre no puede empezar con un espacio.",
    deleteNameTitle: "Quitar nombre personalizado",
    deleteNameMessage:
      "¿Estás seguro de que deseas quitar el nombre personalizado de este dispositivo?",
    trustDevice: "Confiar en este dispositivo",
    trustedDevice: "Dispositivo de confianza",
  },

  // Tracker Detection
  tracker: {
    detected: "Rastreador Detectado",
    subtitle: "Este dispositivo parece ser un rastreador",
    brand: "Marca",
    type: "Tipo",
    confidence: "Confianza",
    confidenceHigh: "Alta",
    confidenceMedium: "Media",
    safetyTip:
      "Si encontraste un rastreador desconocido cerca de ti, considera revisar tus pertenencias. Los rastreadores pueden usarse para monitoreo no autorizado.",
  },

  // RSSI Graph
  rssiGraph: {
    title: "Gráfico de Señal",
    waiting: "Esperando datos de señal...",
    weaker: "Débil",
    stronger: "Fuerte",
    min: "Mín",
    max: "Máx",
  },

  // Export
  export: {
    sessions: "Exportar Sesiones",
    sessionsDesc: "Exportar historial de escaneos como CSV",
    devices: "Exportar Dispositivos",
    devicesDesc: "Exportar lista de dispositivos conocidos como CSV",
    csv: {
      id: "ID",
      startedAt: "Inicio",
      finishedAt: "Fin",
      durationMs: "Duración (ms)",
      deviceCount: "Cant. Dispositivos",
      bleId: "ID BLE",
      name: "Nombre",
      customName: "Nombre Personalizado",
      firstSeen: "Primera Detección",
      lastSeen: "Última Detección",
      appearances: "Apariciones",
      isTracker: "Es Rastreador",
      trackerType: "Tipo de Rastreador",
      yes: "Sí",
      no: "No",
    },
  },

  // Filters
  filters: {
    search: "Buscar dispositivo...",
    signalStrength: "Señal",
    trackersOnly: "Solo rastreadores",
    namedOnly: "Solo con nombre",
    sortBy: "Ordenar por",
    sortRssi: "Señal",
    sortName: "Nombre",
    sortLastSeen: "Último visto",
    clear: "Limpiar filtros",
  },

  // Premium
  premium: {
    gate: {
      message: "Esta funcionalidad es exclusiva del plan Premium.",
      deviceProfile:
        "Desbloquea el historial de sesiones y rastrea cuándo se detectó este dispositivo.",
      button: "Ver Premium",
    },
  },

  // Paywall
  paywall: {
    title: "Premium",
    headline: "Desbloquea Todo",
    subheadline:
      "Acceso completo a todas las funcionalidades de SignalSense con una sola compra.",
    buyButton: "Comprar por {price}",
    buyButtonLoading: "Cargando precio...",
    oneTimePurchase: "Compra única — sin suscripción",
    restore: "Restaurar compra anterior",
    alreadyPremium: "¡Ya eres Premium!",
    regionalPricing: {
      title: "Precio regional aplicado",
      message: "El precio ya está ajustado para tu región.",
    },
    features: {
      history: {
        title: "Historial Ilimitado",
        desc: "Accede a todas tus sesiones de escaneo anteriores",
      },
      deviceProfiles: {
        title: "Perfiles de Dispositivos",
        desc: "Ve detalles completos e historial de cada dispositivo",
      },
      tracker: {
        title: "Detección de Rastreadores",
        desc: "Identifica AirTags, Tiles y otros rastreadores",
      },
      rssiGraph: {
        title: "Gráfico RSSI en Tiempo Real",
        desc: "Visualiza la variación de señal a lo largo del tiempo",
      },
      export: {
        title: "Exportar Datos",
        desc: "Exporta sesiones y dispositivos como CSV",
      },
      filters: {
        title: "Filtros Avanzados",
        desc: "Filtra por señal, nombre, tipo y más",
      },
      antiStalking: {
        title: "Anti-Rastreo Avanzado",
        desc: "Configura dispositivos de confianza y detección personalizada",
      },
      wifiInfo: {
        title: "Análisis de Red Wi-Fi",
        desc: "Escanea redes cercanas, análisis de canales e información detallada",
      },
    },
  },

  // Anti-Stalking
  antiStalking: {
    toggle: {
      label: "Anti-Rastreo",
      monitoring: "Monitoreo activo",
      off: "Monitoreo desactivado",
    },
    alert: {
      title: "Posible Rastreador Detectado",
      following: "Siguiéndote hace {duration} min",
      avgSignal: "Señal promedio: {rssi} dBm",
      dismiss: "Descartar",
      trustDevice: "Confiar",
    },
    banner: {
      monitoring: "Anti-rastreo activo",
      alertCount: "{count} alerta(s)",
    },
    alertSheet: {
      title: "Alertas de Rastreo",
      noAlerts: "Sin alertas activas. ¡Estás seguro!",
    },
    notification: {
      title: "Alerta de Rastreo",
      body: "Un {type} ({brand}) ha estado cerca de ti por {duration} {unit}.",
      bodyUnknown:
        "Un dispositivo desconocido ha estado cerca de ti por {duration} {unit}.",
      minute: "minuto",
      minutes: "minutos",
    },
    errors: {
      startFailed: "Error al iniciar el monitoreo anti-rastreo",
      notificationPermission:
        "Se requiere permiso de notificaciones para alertas de rastreadores",
      backgroundPermission: "Se requiere permiso de ubicación en segundo plano",
    },
  },

  // Wi-Fi
  wifi: {
    idle: {
      tapToStart: "Toca para analizar Wi-Fi",
      description:
        "Monitorea tu conexión Wi-Fi en tiempo real con intensidad de señal, frecuencia y detalles de red.",
      hint: "La app mostrará la información de tu conexión actual. Los usuarios premium también pueden escanear redes cercanas y analizar canales.",
    },
    scanning: "Analizando red...",
    stopMonitoring: "Detener monitoreo",
    connection: {
      title: "Conexión actual",
      signal: "Calidad de señal",
      frequency: "Frecuencia",
      band: "Banda",
      ip: "Dirección IP",
      subnet: "Subred",
      ssid: "Nombre de red",
      connected: "Conectado",
      disconnected: "No conectado a Wi-Fi",
      hidden: "Red oculta",
      cellular: "Conectado por datos móviles",
      otherNetwork: "Conectado a una red no Wi-Fi",
    },
    signal: {
      excellent: "Excelente",
      good: "Buena",
      fair: "Regular",
      weak: "Débil",
      poor: "Mala",
    },
    networks: {
      title: "Redes cercanas",
      empty: "No se encontraron redes",
      scanning: "Escaneando redes cercanas...",
      iosNote:
        "El escaneo de redes cercanas requiere permiso de ubicación para detectar redes Wi-Fi.",
    },
    channels: {
      title: "Análisis de canales",
      low: "Bajo",
      medium: "Medio",
      high: "Alto",
    },
    unavailable: {
      title: "Sin Conexión",
      message:
        "No estás conectado a ninguna red. Conéctate a Wi-Fi e inténtalo de nuevo.",
    },
    error: {
      title: "Error",
    },
    tip: "Las redes de 5 GHz ofrecen velocidades más rápidas con menos interferencia. Si tu señal es débil, intenta acercarte al router o cambiar de banda.",
    tracker: {
      title: "Rastreador de Señal",
      trackSignal: "Rastrear Señal",
      estimatedDistance: "Distancia estimada",
      approximation: "Estimación aproximada",
      graphTitle: "Historial de señal",
      graphWaiting: "Recopilando datos de señal...",
      min: "Mín",
      max: "Máx",
    },
  },

  // Camera Detector
  cameraDetector: {
    title: "Detector de Cámaras",
    subtitle: "Encuentra cámaras Wi-Fi ocultas",
    entryTitle: "Detector de Cámaras",
    entrySubtitle: "Rastrea cámaras Wi-Fi ocultas a tu alrededor",
    scanButton: "Iniciar búsqueda",
    rescanButton: "Escanear de nuevo",
    scanning: "Buscando dispositivos a tu alrededor...",
    hiddenSsid: "Red oculta",
    footer:
      "Esta herramienta reduce el riesgo, no garantiza seguridad. Ninguna app detecta toda cámara — combínala con una búsqueda física (reflejo de lente, orificios sospechosos, objetos fuera de lugar).",
    intro: {
      title: "Busca cámaras ocultas",
      body: "Las cámaras espía en hoteles y Airbnbs casi siempre usan Wi-Fi. Esta búsqueda te ayuda a localizarlas con los sensores de tu teléfono.",
      disclaimer:
        "Resultado honesto: señalamos dispositivos sospechosos, nunca afirmamos 'estás seguro'. Un router común también puede aparecer — usa el sentido común.",
      tips: {
        wifi: {
          title: "Cámaras con su propio Wi-Fi",
          body: "Detectamos y ubicamos por proximidad las cámaras que emiten su propia red.",
        },
        network: {
          title: "Cámaras en la red del lugar",
          body: "Buscamos cámaras ya conectadas al Wi-Fi (puertos RTSP/ONVIF). Detecta presencia, no ubicación.",
        },
        physical: {
          title: "Búsqueda física",
          body: "Revisa reflejos de lente, enchufes, detectores de humo y objetos apuntados a la cama.",
        },
      },
    },
    suspicion: {
      high: "Alta sospecha",
      medium: "Sospecha media",
      low: "Baja sospecha",
      none: "Común",
    },
    reasons: {
      knownVendor: "Fabricante de cámaras",
      ssidPattern: "Nombre sospechoso",
      hiddenSsid: "Red oculta",
      openNetwork: "Red abierta",
      strongSignalClose: "Señal muy fuerte (cerca)",
    },
    results: {
      suspectsTitle: "APs cercanos sospechosos",
      suspectsSubtitle:
        "Ordenados por sospecha y señal. Toca uno para rastrearlo por proximidad.",
      noSuspects:
        "No se encontraron redes cercanas. Activa el Wi-Fi y la ubicación e inténtalo de nuevo.",
      networkTitle: "Cámaras en la red",
      networkSubtitle:
        "Busca cámaras conectadas a tu Wi-Fi actual (debes estar en la misma red).",
      networkScanButton: "Escanear la red",
      networkRescan: "Escanear de nuevo",
      networkScanning: "Rastreando la red...",
      networkNone: "No se encontraron dispositivos parecidos a cámaras en la red.",
      networkUnavailable:
        "No disponible ahora. Conéctate al Wi-Fi — y esta función se activa al actualizar la app.",
      networkError: "No se pudo rastrear la red. Inténtalo de nuevo.",
    },
    hostKind: {
      camera: "Posible cámara",
      nvr: "Posible grabador (NVR/DVR)",
      generic: "Dispositivo con puerto de cámara",
    },
    host: {
      ports: "Puertos",
    },
    hunt: {
      estimatedDistance: "Distancia estimada",
      approximation: "Estimación aproximada por RSSI",
      rssiTitle: "Señal en vivo",
      back: "Volver a la lista",
      throttleNote:
        "Android limita la frecuencia de escaneo de Wi-Fi, así que la distancia se actualiza cada pocos segundos. Camina despacio para sentir si la señal se calienta o enfría.",
      guidance: {
        near: "🔥 Muy cerca — ¡busca aquí!",
        medium: "Calentando — sigue caminando.",
        far: "Frío — aléjate en esa dirección.",
        unknown: "Buscando la señal...",
      },
    },
    errors: {
      locationOff: {
        title: "Activa la ubicación",
        message:
          "Android exige la ubicación activada para escanear redes Wi-Fi cercanas.",
      },
      notAndroid: {
        title: "Solo en Android",
        message:
          "El escaneo de Wi-Fi solo está disponible en Android. iOS no permite este acceso.",
      },
      scanFailed: {
        title: "Falló la búsqueda",
        message: "No se pudieron escanear las redes. Inténtalo de nuevo.",
      },
      openSettings: "Abrir ajustes",
      retry: "Reintentar",
    },
  },

  // Common
  common: {
    close: "Cerrar",
    cancel: "Cancelar",
    loading: "Cargando...",
    retry: "Reintentar",
    unknownDevice: "Dispositivo Desconocido",
    unknown: "Desconocido",
  },
  splash: {
    tagline: "detectar · analizar · proteger",
  },
};
