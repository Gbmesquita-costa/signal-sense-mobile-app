export default {
  // App
  appName: "SignalSense",

  // Tabs
  tabs: {
    scan: "Scan",
    proximity: "Proximidade",
    environment: "Ambiente",
    wifi: "Wi-Fi",
    education: "Educação",
  },

  // Settings
  settings: {
    title: "Configurações",

    // Theme section
    theme: {
      title: "Tema",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    },

    // Language section
    language: {
      title: "Idioma",
    },

    // About section
    about: {
      title: "Sobre",
      description:
        "SignalSense é uma ferramenta de privacidade pessoal que ajuda você a detectar sinais de dispositivos ao seu redor. Não fazemos promessas absolutas — oferecemos consciência.",
    },

    // Premium section
    premium: {
      title: "Premium",
      active: "Premium ativo",
      upgrade: "Desbloquear Premium",
    },

    // Export section
    export: {
      title: "Exportar Dados",
    },

    // Anti-Stalking section
    antiStalking: {
      title: "Anti-Rastreamento",
      enable: "Ativar Monitoramento",
      enableDesc: "Escaneia rastreadores em segundo plano",
      trustedDevices: "Dispositivos Confiáveis",
      trustedDevicesDesc:
        "Dispositivos que você marcou como seguros não disparam alertas.",
      noTrustedDevices: "Nenhum dispositivo confiável ainda.",
    },

    // Privacy section
    privacy: {
      title: "Privacidade",
      content:
        "Sua privacidade é nossa prioridade. O SignalSense:\n\n• Não coleta nenhum dado pessoal\n• Não possui backend ou servidor\n• Todo processamento acontece localmente no seu dispositivo\n• Não rastreia sua localização\n• Não compartilha informações com terceiros",
    },
  },

  // Scan screen
  scan: {
    title: "Varredura de Sinais",
    tapToStart: "Toque para iniciar a varredura",
    description: "Detecte dispositivos Bluetooth ao seu redor",
    scanning: "Escaneando...",
    disclaimer: "Detectamos apenas sinais ativos. Nenhum dado é coletado.",
    error: "Erro",
    retry: "Tentar novamente",
    settings: "Configurações",
    signalStrength: {
      weak: "Fraco",
      medium: "Médio",
      strong: "Forte",
    },
    states: {
      checking: "Verificando...",
      checkingPermissions: "Verificando permissões...",
      requestingPermissions: "Solicitando permissões...",
      checkingBluetooth: "Verificando Bluetooth...",
      initializing: "Inicializando sensores...",
      scanning: "Buscando dispositivos...",
      foundDevices: "{count} dispositivo(s) encontrado(s)",
      finished: "{count} dispositivo(s) encontrado(s)",
      error: "Ocorreu um erro",
      loadingMore: "Carregando mais...",
      searchingDevices: "Buscando dispositivos...",
    },
    errorMessages: {
      bluetoothOff:
        "Bluetooth está desligado. Ligue o Bluetooth para continuar.",
      locationOff:
        "A localização está desativada. Ative a localização para continuar.",
    },
  },

  // Proximity screen
  proximity: {
    // Estado vazio
    empty: {
      title: "Nenhum Dispositivo Selecionado",
      message:
        "Vá para o Scan e selecione um dispositivo para monitorar sua proximidade.",
      button: "Ir para Scan",
    },

    // Estado pronto
    ready: {
      message:
        "Toque no botão abaixo para iniciar o monitoramento de proximidade.",
    },

    // Botões
    startMonitoring: "Iniciar Monitoramento",
    monitoringLoading: "Inicializando monitoramento...",
    stopMonitoring: "Parar Monitoramento",
    changeDevice: "Trocar Dispositivo",

    // Sinal perdido
    signalLost: {
      title: "Sinal Perdido",
      message:
        "O dispositivo não está mais respondendo. Ele pode estar fora de alcance ou desligado.",
      retry: "Tentar Novamente",
      newScan: "Novo Scan",
    },

    // Níveis de proximidade
    levels: {
      near: "Muito Próximo",
      medium: "Distância Média",
      far: "Distante",
      unknown: "Desconhecido",
    },

    // Distância
    distance: {
      estimated: "Distância Estimada",
      real: "Distância Real",
      precise: "PRECISO",
    },

    // RSSI
    rssi: {
      raw: "RSSI bruto",
    },

    // Erros de permissão/serviços
    errors: {
      bluetoothOff: {
        title: "Bluetooth Desligado",
        message:
          "O Bluetooth precisa estar ligado para monitorar este dispositivo.",
      },
      locationOff: {
        title: "Localização Desativada",
        message:
          "A localização precisa estar ativada para monitorar dispositivos.",
      },
      generic: {
        title: "Erro ao Monitorar",
        message: "Ocorreu um erro ao tentar iniciar o monitoramento.",
      },
      openSettings: "Abrir Configurações",
    },
  },

  // Environment screen
  environment: {
    // Idle
    idle: {
      initializingSensor: "Inicializando sensor...",
      tapToStart: "Toque para iniciar",
      description:
        "O magnetômetro detectará variações no campo magnético ao seu redor",
      hint: "O campo magnético normal da Terra é de 25-65 µT.\nValores elevados podem indicar interferência de objetos metálicos, motores ou dispositivos eletrônicos próximos.",
    },

    // Estados
    initializing: "Inicializando magnetômetro...",
    stopMonitoring: "Parar Monitoramento",

    // Labels
    statusLabel: "STATUS DO AMBIENTE",
    axis: "Eixo",

    // Status
    status: {
      stable: "Ambiente Estável",
      moderate: "Interferência Moderada",
      high: "Campo Magnético Elevado",
      extreme: "Forte Interferência",
    },

    // Sensor indisponível
    unavailable: {
      title: "Sensor Indisponível",
      message:
        "Seu dispositivo não possui um magnetômetro ou ele não está acessível.",
    },

    // Erro
    error: {
      title: "Erro ao Acessar Sensor",
    },

    // Dica educativa
    tip: "Variações no campo magnético podem ser causadas por objetos metálicos, motores, alto-falantes ou dispositivos eletrônicos próximos. Valores elevados não significam necessariamente perigo.",
  },

  // Education screen
  education: {
    title: "Educação",
    subtitle: "Entenda como o app funciona e o que cada medição significa.",
    tip: "Dica",
    disclaimer:
      "Não fazemos promessas absolutas sobre detecção ou medição. Use com consciência.",

    // Topics
    topics: {
      // 1. Introduction
      intro: {
        title: "O que é o SignalSense?",
        description:
          "Conheça o app e entenda o que ele faz — e o que ele não faz.",
        sections: [
          {
            title: "Visão Geral",
            content:
              "O SignalSense é uma ferramenta que analisa sinais de rádio (Bluetooth) e campos magnéticos para ajudar você a entender o ambiente ao seu redor. Ele transforma dados técnicos em informações compreensíveis.",
          },
          {
            title: "O que ele faz",
            content:
              "• Detecta dispositivos emitindo sinais Bluetooth (BLE)\n• Estima a proximidade de dispositivos selecionados\n• Monitora variações no campo magnético do ambiente\n• Registra histórico completo de sessões\n• Identifica possíveis rastreadores (AirTag, Tile, etc.)\n• Permite nomear e gerenciar perfis de dispositivos\n• Apresenta os dados de forma visual e educativa",
          },
          {
            title: "O que ele NÃO faz",
            content:
              "• Não detecta dispositivos desligados ou ocultos sem sinal\n• Não é um detector de metais\n• Não vê através de paredes com precisão\n• Não identifica pessoas ou objetos específicos\n• Não substitui equipamentos profissionais de segurança\n• Não detecta Bluetooth Clássico (apenas BLE)",
          },
        ],
        tip: "Use o SignalSense como uma ferramenta de conscientização, não como um dispositivo de segurança absoluto.",
      },

      // 2. Scan
      scan: {
        title: "Como funciona o Scan",
        description:
          "Entenda como a varredura de sinais detecta dispositivos ao seu redor.",
        sections: [
          {
            title: "Bluetooth Low Energy (BLE)",
            content:
              "O Scan detecta dispositivos que estão ativamente emitindo sinais BLE (Bluetooth Low Energy). Bluetooth é usado por fones, relógios, caixas de som, rastreadores e dispositivos inteligentes. Dispositivos Bluetooth Clássico (como alguns fones de ouvido mais antigos) não são detectáveis pelo scan.",
          },
          {
            title: "O que significa 'dispositivo encontrado'",
            content:
              "Quando um dispositivo aparece na lista, significa que ele está emitindo um sinal que seu celular conseguiu captar. Isso NÃO significa necessariamente que está perto — sinais podem atravessar paredes e percorrer dezenas de metros.",
          },
          {
            title: "Interações na lista de dispositivos",
            content:
              "• Toque rápido: seleciona o dispositivo para monitorar no Proximity\n• Toque longo (pressionar e segurar): abre o perfil completo do dispositivo com histórico de sessões, nome personalizado e detalhes técnicos\n• Barras de sinal: indicam a força do RSSI em tempo real\n• Badge de rastreador: aparece quando o dispositivo é identificado como possível rastreador",
          },
          {
            title: "Filtros avançados (Premium)",
            content:
              "• Busca por nome: pesquise dispositivos pelo nome ou nome personalizado\n• Filtro por sinal: Forte (≥ -60 dBm), Médio (-60 a -80 dBm), Fraco (< -80 dBm)\n• Apenas rastreadores: mostra somente dispositivos identificados como rastreadores\n• Apenas nomeados: mostra somente dispositivos com nome personalizado\n• Ordenação: por sinal (RSSI), por nome ou por última detecção",
          },
          {
            title: "Por que os resultados variam",
            content:
              "• Paredes e obstáculos atenuam o sinal\n• Outros dispositivos podem causar interferência\n• Alguns dispositivos emitem sinais intermitentes\n• A orientação do celular afeta a recepção\n• Materiais metálicos refletem sinais",
          },
          {
            title: "Como o Bluetooth funciona",
            content:
              "• O scan processa dispositivos em lotes a cada 100ms\n• Cada dispositivo é atualizado no máximo a cada 500ms para evitar sobrecarga\n• Dispositivos BLE emitem sinais periódicos (advertisements)\n• O alcance típico é de 10-30 metros em ambientes internos\n• A força do sinal diminui com a distância e obstáculos",
          },
        ],
        tip: "Dispositivos que não aparecem podem estar desligados, em modo avião, ou simplesmente fora de alcance. Pressione e segure um dispositivo para ver seu perfil completo.",
      },

      // 3. Proximity
      proximity: {
        title: "Como funciona o Proximity",
        description: "Saiba como o app estima a distância até um dispositivo.",
        sections: [
          {
            title: "O que é RSSI",
            content:
              "RSSI (Received Signal Strength Indicator) é a medida da força do sinal recebido, em dBm. Valores mais próximos de 0 indicam sinal mais forte. Ex: -30 dBm é muito forte, -90 dBm é muito fraco.",
          },
          {
            title: "Estimativa de distância",
            content:
              "O app usa o modelo de Friis (propagação de sinais) para converter RSSI em distância estimada. A fórmula considera a potência de transmissão (TX Power), o fator ambiental (2.0 a 4.0) e aplica calibração automática baseada no histórico de amostras.",
          },
          {
            title: "Como o app estabiliza os valores",
            content:
              "O app usa múltiplas técnicas para suavizar a distância:\n• Suavização EMA (Exponential Moving Average) no RSSI com fator 0.3 — 70% do valor anterior é preservado\n• Calibração de TX Power via mediana das últimas 30 amostras, recalibrada a cada 30 novas amostras\n• Fator ambiental com transição suave (sem saltos abruptos)\n• Suavização final na distância (EMA 0.2)\n• A UI atualiza a cada 300ms, alinhada com as animações",
          },
          {
            title: "Níveis de proximidade",
            content:
              "• Perto (RSSI ≥ -60 dBm): dispositivo provavelmente a menos de 2 metros\n• Médio (RSSI entre -60 e -80 dBm): dispositivo a alguns metros de distância\n• Longe (RSSI < -80 dBm): dispositivo distante ou com obstáculos\n• Se o dispositivo não responder por 5 segundos, o sinal é considerado perdido",
          },
          {
            title: "Por que a distância varia mesmo parado",
            content:
              "Mesmo com o celular estático, o RSSI varia naturalmente ±2-5 dBm devido a reflexões e interferência do ambiente. Como a fórmula de distância é exponencial, pequenas variações de RSSI causam mudanças maiores na distância. O app minimiza isso com suavização, mas variações leves são normais e esperadas.",
          },
          {
            title: "Gráfico RSSI (Premium)",
            content:
              "O gráfico em tempo real mostra a variação do RSSI ao longo do tempo, com até 80 amostras visíveis. Inclui estatísticas de RSSI atual, mínimo e máximo. Útil para identificar padrões de sinal e testar posicionamento.",
          },
        ],
        tip: "Trate a distância estimada como uma referência aproximada. Para melhores resultados, mantenha o celular parado e sem obstruções entre ele e o dispositivo.",
      },

      // 4. Environment
      environment: {
        title: "Como funciona o Environment",
        description:
          "Entenda o que o magnetômetro mede e o que os valores significam.",
        sections: [
          {
            title: "O que é o Magnetômetro",
            content:
              "O magnetômetro é um sensor presente na maioria dos smartphones que mede campos magnéticos em microteslas (µT). Ele é usado em bússolas digitais e aplicativos de navegação.",
          },
          {
            title: "Campo magnético normal",
            content:
              "O campo magnético da Terra varia entre 25-65 µT dependendo da localização. Valores estáveis nessa faixa indicam um ambiente sem interferências significativas.",
          },
          {
            title: "O que causa variações",
            content:
              "• Objetos metálicos (móveis, estruturas)\n• Ímãs e alto-falantes\n• Motores elétricos\n• Cabos de alta tensão\n• Dispositivos eletrônicos ligados",
          },
          {
            title: "O que os níveis significam",
            content:
              "O app usa histerese para evitar oscilação nos limites:\n• Estável: abaixo de 70 µT (volta para estável abaixo de 55 µT)\n• Moderado: entre 55-150 µT (muda para elevado acima de 150 µT)\n• Elevado: entre 120-400 µT (muda para extremo acima de 400 µT)\n• Extremo: acima de 400 µT (volta para elevado abaixo de 330 µT)",
          },
          {
            title: "Como o monitoramento funciona",
            content:
              "• O sensor atualiza a ~30 FPS (a cada 33ms)\n• Suavização EMA com fator 0.3 para evitar micro-tremores\n• Os valores X, Y e Z são animados diretamente na UI (60 FPS) sem re-renders\n• O feedback háptico vibra quando o nível aumenta, com intervalo mínimo de 800ms\n• O status visual atualiza no máximo 2x por segundo para evitar piscadas",
          },
        ],
        tip: "Valores altos não significam perigo — apenas indicam presença de fontes magnéticas próximas. Mova o celular lentamente para mapear a fonte.",
      },

      // 5. History
      history: {
        title: "Histórico de Sessões",
        description:
          "Entenda como o app registra e organiza suas sessões de monitoramento.",
        sections: [
          {
            title: "O que é registrado",
            content:
              "Toda vez que você faz um scan, monitora a proximidade de um dispositivo, ou usa o sensor de ambiente, o app cria uma sessão no histórico. Cada sessão registra: horário de início e fim, duração, tipo de sessão e dados relevantes.",
          },
          {
            title: "Tipos de sessão",
            content:
              "• Scan BLE: registra todos os dispositivos encontrados, com estatísticas de RSSI (mínimo, máximo, média) de cada um\n• Proximidade: registra o monitoramento de um dispositivo específico, com amostras de RSSI e distância estimada\n• Ambiente: registra leituras do magnetômetro (X, Y, Z, magnitude e status) ao longo do tempo",
          },
          {
            title: "Filtros do histórico",
            content:
              "Use os chips no topo da tela para filtrar por tipo:\n• Todos: mostra todas as sessões\n• Scan: apenas sessões de varredura BLE\n• Proximidade: apenas sessões de monitoramento de proximidade\n• Ambiente: apenas sessões do magnetômetro",
          },
          {
            title: "Gerenciamento de sessões",
            content:
              "• Deslize uma sessão para a esquerda para deletá-la\n• As sessões são agrupadas por data (Hoje, Ontem, ou a data completa)\n• Duração e contagem de dispositivos são exibidas em cada card\n• Puxe para baixo para atualizar a lista",
          },
          {
            title: "Limite gratuito",
            content:
              "Usuários gratuitos podem ver as últimas 3 sessões. Para acessar o histórico completo e ilimitado, é necessário o plano Premium.",
          },
        ],
        tip: "O histórico é salvo localmente no seu dispositivo. As sessões só são criadas quando o monitoramento realmente começa a receber dados — se você cancelar durante o carregamento, nenhuma sessão vazia é criada.",
      },

      // 6. Device Profiles
      deviceProfiles: {
        title: "Perfis de Dispositivos",
        description:
          "Saiba como gerenciar dispositivos detectados e personalizar seus nomes.",
        sections: [
          {
            title: "O que é um perfil de dispositivo",
            content:
              "Cada dispositivo Bluetooth detectado pelo app ganha automaticamente um perfil. O perfil armazena: ID Bluetooth, nome original (se disponível), nome personalizado, primeira e última detecção, quantidade de aparições e se é um possível rastreador.",
          },
          {
            title: "Como acessar o perfil",
            content:
              "Na tela de Scan, pressione e segure (toque longo) em qualquer dispositivo da lista para abrir seu perfil completo. O perfil é uma funcionalidade Premium.",
          },
          {
            title: "Nome personalizado",
            content:
              "• Toque no ícone de edição ao lado do nome para definir um nome personalizado\n• O nome personalizado aparece em todas as telas do app (Scan, Proximity, Histórico)\n• Máximo de 30 caracteres\n• Para remover o nome personalizado, toque no X ao lado do nome",
          },
          {
            title: "Descoberta de nome via GATT",
            content:
              "Se um dispositivo não tem nome visível, você pode tentar descobri-lo. O app tenta múltiplas estratégias:\n• Cache do sistema BLE (sem conexão)\n• Conexão direta e leitura GATT\n• Fallback com autoConnect no Android\n\nNota: dispositivos Bluetooth Clássico (não-BLE) podem não responder. Nesse caso, use o nome personalizado.",
          },
          {
            title: "Histórico de aparições",
            content:
              "O perfil mostra todas as sessões de scan em que o dispositivo foi detectado, com data, duração, quantidade de dispositivos na sessão e estatísticas de RSSI (média). Funcionalidade exclusiva Premium.",
          },
        ],
        tip: "Use nomes personalizados para identificar facilmente seus dispositivos conhecidos. O nome aparece em todo o app.",
      },

      // 7. Premium
      premium: {
        title: "Plano Premium",
        description:
          "Conheça as funcionalidades exclusivas e o que o plano gratuito oferece.",
        sections: [
          {
            title: "O que é gratuito",
            content:
              "• Scan BLE completo e ilimitado\n• Monitoramento de proximidade (distância e nível)\n• Monitoramento do campo magnético (ambiente)\n• Até 3 sessões no histórico\n• Aba de educação completa\n• Temas claro e escuro",
          },
          {
            title: "O que o Premium desbloqueia",
            content:
              "• Histórico ilimitado de sessões\n• Perfis de dispositivos (toque longo no scan)\n• Detecção de rastreadores (AirTag, Tile, SmartTag, etc.)\n• Gráfico RSSI em tempo real no Proximity\n• Exportação de dados como CSV\n• Filtros avançados no Scan (busca, sinal, rastreadores, nomeados, ordenação)",
          },
          {
            title: "Como funciona a compra",
            content:
              "O Premium é uma compra única — sem assinatura, sem cobrança recorrente. Uma vez comprado, é seu para sempre. A compra é processada pelo Google Play.",
          },
          {
            title: "Restaurar compra",
            content:
              "Se você trocar de celular, reinstalar o app ou formatar o aparelho, sua compra não é perdida. O Google guarda o registro da sua compra vinculado à sua conta Google.\n\nBasta tocar em 'Restaurar compra anterior' na tela Premium — o app consulta a loja, confirma que você já pagou e libera o Premium novamente. Sem custo adicional.",
          },
          {
            title: "Preço regional",
            content:
              "O preço do Premium é ajustado automaticamente para a sua região. Se você está no Brasil, o valor já aparece em reais (BRL) com preço adaptado ao mercado local.\n\nIsso é feito diretamente pelo Google Play — garantindo um preço justo e acessível independente do país.",
          },
        ],
        tip: "O plano gratuito já oferece todas as funcionalidades principais. O Premium é para quem quer o máximo do app.",
      },

      // 8. Anti-Stalking
      antiStalking: {
        title: "Proteção Anti-Rastreamento",
        description:
          "Saiba como o app ajuda a detectar dispositivos Bluetooth que podem estar te seguindo.",
        sections: [
          {
            title: "O que é o Anti-Rastreamento?",
            content:
              "A funcionalidade anti-rastreamento monitora todos os dispositivos Bluetooth (BLE) ao seu redor — não apenas rastreadores conhecidos como AirTags ou Tiles, mas qualquer dispositivo que pareça estar se movendo com você ao longo do tempo. Se um dispositivo é detectado próximo a você consistentemente por 15+ minutos, você recebe um alerta. Essa abordagem mais ampla garante que até dispositivos improvisados ou menos conhecidos sejam detectados.",
          },
          {
            title: "Como funciona a detecção",
            content:
              "O app escaneia periodicamente todos os dispositivos BLE ao alcance. Rastreadores conhecidos (AirTag, Tile, SmartTag, etc.) são identificados com maior confiança, enquanto dispositivos desconhecidos são rastreados com menor confiança. Se qualquer dispositivo persiste além da janela de tempo configurada (padrão 15 minutos) com um número mínimo de avistamentos, ele é marcado como suspeito.",
          },
          {
            title: "Monitoramento em segundo plano",
            content:
              "Quando ativado, o app continua escaneando mesmo quando minimizado. Ele executa rajadas curtas de scan em segundo plano e envia uma notificação push se um dispositivo suspeito for encontrado. O scan em segundo plano usa bateria mínima.",
          },
          {
            title: "Dispositivos confiáveis",
            content:
              "Você pode marcar qualquer dispositivo como confiável na tela de perfil dele para evitar falsos alertas. Por exemplo, seus próprios fones de ouvido, um smartwatch ou o AirTag de um familiar. Dispositivos confiáveis são permanentemente ignorados pelo sistema de detecção até que você os remova.",
          },
          {
            title: "Limitações",
            content:
              "• A detecção depende dos dispositivos estarem emitindo sinais BLE ativamente\n• Alguns dispositivos podem rotacionar seu endereço Bluetooth, dificultando o rastreamento persistente\n• A frequência do scan em segundo plano depende de restrições do sistema operacional\n• Monitorar todos os dispositivos pode gerar mais alertas — use a função de confiança para reduzir o ruído\n• Esta é uma ferramenta de conscientização, não uma garantia de segurança\n• Se você se sentir inseguro, entre em contato com as autoridades locais",
          },
        ],
        tip: "Mantenha o anti-rastreamento ativado ao viajar sozinho ou em áreas desconhecidas. Se receber um alerta, verifique seus pertences e arredores cuidadosamente. Você pode confiar nos seus próprios dispositivos pelo perfil deles para reduzir falsos alertas.",
      },

      // 9. Wi-Fi Info
      wifiInfo: {
        title: "Informações Wi-Fi",
        description:
          "Entenda como funciona a análise Wi-Fi e quais informações estão disponíveis.",
        sections: [
          {
            title: "O que é Wi-Fi Info?",
            content:
              "A função Wi-Fi Info permite monitorar sua conexão Wi-Fi atual em tempo real — incluindo intensidade de sinal, banda de frequência, endereço IP e mais. Ajuda você a entender seu ambiente de rede rapidamente.",
          },
          {
            title: "Qualidade do sinal",
            content:
              "A intensidade do sinal é medida como porcentagem (0-100%). Excelente (80%+) significa conexão rápida e estável. Boa (60-79%) é confiável para a maioria das tarefas. Regular (40-59%) pode causar velocidades mais lentas. Sinal Fraco ou Ruim pode levar a desconexões.",
          },
          {
            title: "Bandas de frequência",
            content:
              "Wi-Fi opera em diferentes bandas de frequência:\n• 2.4 GHz — maior alcance mas mais lento, mais interferência\n• 5 GHz — velocidades mais rápidas, menor alcance, menos congestionamento\n• 6 GHz — banda mais nova, velocidades mais rápidas, menor alcance\n\nO app mostra qual banda sua conexão usa.",
          },
          {
            title: "Escaneamento de redes próximas",
            content:
              "A versão premium pode escanear todas as redes Wi-Fi próximas. Isso mostra a intensidade de sinal (RSSI em dBm), canal, banda de frequência e tipo de segurança de cada rede. É útil para encontrar canais menos congestionados.",
          },
          {
            title: "Análise de canais",
            content:
              "Múltiplas redes no mesmo canal causam interferência. O gráfico de análise de canais (premium) mostra quantas redes ocupam cada canal, ajudando a identificar o canal menos congestionado para seu roteador.",
          },
          {
            title: "Rastreador de Sinal",
            content:
              "O Rastreador de Sinal permite localizar seu roteador rastreando a intensidade do sinal Wi-Fi em tempo real. Ele possui um radar animado que reage às mudanças de sinal, uma distância estimada até o roteador e uma barra de progresso da intensidade do sinal. Ande pela sua casa e veja o sinal atualizar ao vivo — quanto mais perto do roteador, mais forte o sinal. O gráfico de histórico do sinal (premium) mostra como o sinal varia ao longo do tempo.",
          },
        ],
        tip: "Use o Rastreador de Sinal para encontrar o melhor local para seus dispositivos. Ande pela casa e observe o radar — quando o sinal estiver mais forte, você está mais perto do roteador. Para a melhor experiência, conecte-se a uma rede 5 GHz quando estiver próximo.",
      },

      // 10. Interference
      interference: {
        title: "O que causa interferência",
        description:
          "Conheça os fatores que afetam as medições de sinais e campos magnéticos.",
        sections: [
          {
            title: "Interferência em sinais de rádio",
            content:
              "• Paredes (especialmente concreto e metal)\n• Água (incluindo o corpo humano)\n• Outros dispositivos na mesma frequência\n• Micro-ondas e equipamentos industriais\n• Redes Wi-Fi congestionadas",
          },
          {
            title: "Interferência magnética",
            content:
              "• Estruturas metálicas (vigas, portões)\n• Eletrodomésticos (geladeira, máquina de lavar)\n• Eletrônicos (computadores, TVs)\n• Veículos próximos\n• Cabos elétricos na parede",
          },
          {
            title: "Como minimizar interferência",
            content:
              "• Afaste-se de grandes estruturas metálicas\n• Evite medir próximo a eletrodomésticos ligados\n• Mantenha o celular afastado de outros dispositivos\n• Teste em diferentes posições e orientações",
          },
        ],
      },

      // 9. Limitations
      limitations: {
        title: "Limitações do App",
        description:
          "É importante entender o que o SignalSense NÃO pode fazer.",
        sections: [
          {
            title: "Não é um GPS",
            content:
              "O app não usa GPS para localização de dispositivos. A estimativa de distância é baseada apenas na força do sinal de rádio, que é muito menos precisa.",
          },
          {
            title: "Não vê através de paredes",
            content:
              "Embora sinais de rádio atravessem paredes, a atenuação causa imprecisões significativas. Você não pode determinar com certeza se um dispositivo está no cômodo ao lado.",
          },
          {
            title: "Não identifica pessoas ou objetos",
            content:
              "O app detecta sinais de dispositivos, não pessoas. Um sinal Bluetooth pode ser de um fone de ouvido esquecido, não necessariamente de uma pessoa.",
          },
          {
            title: "Não é equipamento profissional",
            content:
              "O SignalSense usa os sensores do seu smartphone, que são projetados para uso geral. Equipamentos profissionais de segurança ou medição são muito mais precisos e confiáveis.",
          },
          {
            title: "Não detecta dispositivos desligados",
            content:
              "Se um dispositivo está desligado, em modo avião, ou não emitindo sinais ativamente, ele será invisível para o Scan. O app detecta apenas Bluetooth Low Energy (BLE), não Bluetooth Clássico.",
          },
        ],
        tip: "Use o SignalSense para aprender e ter consciência, não como ferramenta de segurança definitiva.",
      },

      // 10. Best Practices
      bestPractices: {
        title: "Boas Práticas",
        description:
          "Dicas para obter os melhores resultados com o SignalSense.",
        sections: [
          {
            title: "Posicionamento do celular",
            content:
              "• Segure o celular com a tela para cima\n• Evite cobrir as bordas com as mãos\n• Mantenha o celular relativamente parado durante medições\n• A antena geralmente fica na parte inferior ou superior",
          },
          {
            title: "Ambiente de teste",
            content:
              "• Teste primeiro em um local conhecido e calmo\n• Compare resultados em diferentes ambientes\n• Lembre-se que cada local tem suas características\n• Faça múltiplas medições para confirmar padrões",
          },
          {
            title: "Interpretação dos dados",
            content:
              "• Não tire conclusões de uma única medição\n• Observe tendências e padrões ao longo do tempo\n• Considere o contexto do ambiente\n• Lembre-se das limitações técnicas",
          },
          {
            title: "Uso responsável",
            content:
              "• Use o app para fins educativos e de conscientização\n• Respeite a privacidade de outras pessoas\n• Não use para atividades ilegais ou antiéticas\n• Compartilhe conhecimento de forma responsável",
          },
        ],
        tip: "A prática e a experimentação são as melhores formas de entender como os sinais se comportam no seu ambiente.",
      },
    },
  },

  // History
  history: {
    title: "Histórico",
    device: "dispositivo",
    devices: "dispositivos",
    session: "sessão no total",
    sessions: "sessões no total",
    showingLast: "mostrando últimas",
    empty: "Nenhuma sessão registrada ainda. Faça um scan para começar.",
    premiumHint: "Desbloqueie o Premium para acessar todo o seu histórico.",
    today: "Hoje",
    yesterday: "Ontem",
    duration: {
      seconds: "s",
      minutes: "min",
      hours: "h",
    },
    filterAll: "Todos",
    filterScan: "Scan",
    filterProximity: "Proximidade",
    filterEnvironment: "Ambiente",
    filterWifi: "Wi-Fi",
    sessionTypes: {
      scan: "Scan BLE",
      proximity: "Proximidade",
      environment: "Ambiente",
      wifi: "Wi-Fi",
    },
  },

  // Device Profile
  deviceProfile: {
    notFound: "Dispositivo não encontrado.",
    bleId: "ID Bluetooth",
    firstSeen: "Primeiro visto",
    lastSeen: "Último visto",
    appearances: "Aparições",
    sessionHistory: "Histórico de Sessões",
    noSessions: "Nenhuma sessão registrada para este dispositivo.",
    signal: "Sinal",
    resolveName: "Descobrir nome",
    resolveNameHint:
      "Conecta brevemente ao dispositivo para obter o nome. Consome mais energia.",
    resolveNameError:
      "Não foi possível conectar ao dispositivo. Verifique se está ligado e por perto.",
    resolveNameTimeout:
      "Não foi possível conectar. O dispositivo pode usar Bluetooth Clássico (ex: fones de ouvido) que não suporta leitura de nome via BLE. Tente dar um nome manualmente.",
    resolveNameGattFailed:
      "Conectou ao dispositivo, mas não permitiu leitura dos dados. Pode precisar de pareamento.",
    resolveNameNotFound:
      "Conectou ao dispositivo, mas ele não divulga o nome por nenhum método BLE conhecido.",
    editName: "Editar nome",
    editNamePlaceholder: "Nome do dispositivo",
    editNameSave: "Salvar",
    editNameClear: "Remover nome",
    editNameLimitReached: "Limite de caracteres atingido.",
    editNameNoMultipleSpaces: "Espaços consecutivos não permitidos.",
    editNameNoLeadingSpace: "Nome não pode começar com espaço.",
    deleteNameTitle: "Remover nome personalizado",
    deleteNameMessage:
      "Tem certeza que deseja remover o nome personalizado deste dispositivo?",
    trustDevice: "Confiar neste dispositivo",
    trustedDevice: "Dispositivo confiável",
  },

  // Tracker Detection
  tracker: {
    detected: "Rastreador Detectado",
    subtitle: "Este dispositivo parece ser um rastreador",
    brand: "Marca",
    type: "Tipo",
    confidence: "Confiança",
    confidenceHigh: "Alta",
    confidenceMedium: "Média",
    safetyTip:
      "Se você encontrou um rastreador desconhecido próximo a você, considere verificar seus pertences. Rastreadores podem ser usados para monitoramento não autorizado.",
  },

  // RSSI Graph
  rssiGraph: {
    title: "Gráfico de Sinal",
    waiting: "Aguardando dados de sinal...",
    weaker: "Fraco",
    stronger: "Forte",
    min: "Min",
    max: "Max",
  },

  // Export
  export: {
    sessions: "Exportar Sessões",
    sessionsDesc: "Exportar histórico de scans como CSV",
    devices: "Exportar Dispositivos",
    devicesDesc: "Exportar lista de dispositivos conhecidos como CSV",
    csv: {
      id: "ID",
      startedAt: "Início",
      finishedAt: "Fim",
      durationMs: "Duração (ms)",
      deviceCount: "Qtd. Dispositivos",
      bleId: "ID BLE",
      name: "Nome",
      customName: "Nome Personalizado",
      firstSeen: "Primeira Detecção",
      lastSeen: "Última Detecção",
      appearances: "Aparições",
      isTracker: "É Rastreador",
      trackerType: "Tipo de Rastreador",
      yes: "Sim",
      no: "Não",
    },
  },

  // Filters
  filters: {
    search: "Buscar dispositivo...",
    signalStrength: "Sinal",
    trackersOnly: "Apenas rastreadores",
    namedOnly: "Apenas nomeados",
    sortBy: "Ordenar por",
    sortRssi: "Sinal",
    sortName: "Nome",
    sortLastSeen: "Último visto",
    clear: "Limpar filtros",
  },

  // Premium
  premium: {
    gate: {
      message: "Esta funcionalidade é exclusiva do plano Premium.",
      deviceProfile:
        "Desbloqueie o histórico de sessões e acompanhe quando este dispositivo foi detectado.",
      button: "Ver Premium",
    },
  },

  // Paywall
  paywall: {
    title: "Premium",
    headline: "Desbloqueie Tudo",
    subheadline:
      "Acesso completo a todas as funcionalidades do SignalSense com uma única compra.",
    buyButton: "Comprar por {price}",
    buyButtonLoading: "Carregando preço...",
    oneTimePurchase: "Compra única — sem assinatura",
    restore: "Restaurar compra anterior",
    alreadyPremium: "Você já é Premium!",
    regionalPricing: {
      title: "Preço regional aplicado",
      message: "O preço já está ajustado para a sua região.",
    },
    features: {
      history: {
        title: "Histórico Ilimitado",
        desc: "Acesse todas as suas sessões de scan anteriores",
      },
      deviceProfiles: {
        title: "Perfis de Dispositivos",
        desc: "Veja detalhes completos e histórico de cada dispositivo",
      },
      tracker: {
        title: "Detecção de Rastreadores",
        desc: "Identifique AirTags, Tiles e outros rastreadores",
      },
      rssiGraph: {
        title: "Gráfico RSSI em Tempo Real",
        desc: "Visualize a variação do sinal ao longo do tempo",
      },
      export: {
        title: "Exportar Dados",
        desc: "Exporte sessões e dispositivos como CSV",
      },
      filters: {
        title: "Filtros Avançados",
        desc: "Filtre por sinal, nome, tipo e muito mais",
      },
      antiStalking: {
        title: "Anti-Rastreamento Avançado",
        desc: "Configure dispositivos confiáveis e detecção personalizada",
      },
      wifiInfo: {
        title: "Análise de Rede Wi-Fi",
        desc: "Escaneie redes próximas, análise de canais e informações detalhadas",
      },
    },
  },

  // Anti-Stalking
  antiStalking: {
    toggle: {
      label: "Anti-Rastreamento",
      monitoring: "Monitoramento ativo",
      off: "Monitoramento desativado",
    },
    alert: {
      title: "Possível Rastreador Detectado",
      following: "Te seguindo há {duration} min",
      avgSignal: "Sinal médio: {rssi} dBm",
      dismiss: "Dispensar",
      trustDevice: "Confiar",
    },
    banner: {
      monitoring: "Anti-rastreamento ativo",
      alertCount: "{count} alerta(s)",
    },
    alertSheet: {
      title: "Alertas de Rastreamento",
      noAlerts: "Nenhum alerta ativo. Você está seguro!",
    },
    notification: {
      title: "Alerta de Rastreamento",
      body: "Um {type} ({brand}) está próximo de você há {duration} {unit}.",
      bodyUnknown:
        "Um dispositivo desconhecido está próximo de você há {duration} {unit}.",
      minute: "minuto",
      minutes: "minutos",
    },
    errors: {
      startFailed: "Falha ao iniciar o monitoramento anti-rastreamento",
      notificationPermission:
        "Permissão de notificação é necessária para alertas de rastreadores",
      backgroundPermission:
        "Permissão de localização em segundo plano é necessária",
    },
  },

  // Wi-Fi
  wifi: {
    idle: {
      tapToStart: "Toque para analisar Wi-Fi",
      description:
        "Monitore sua conexão Wi-Fi em tempo real com intensidade de sinal, frequência e detalhes da rede.",
      hint: "O app mostrará as informações da sua conexão atual. Usuários premium também podem escanear redes próximas e analisar canais.",
    },
    scanning: "Analisando rede...",
    stopMonitoring: "Parar monitoramento",
    connection: {
      title: "Conexão atual",
      signal: "Qualidade do sinal",
      frequency: "Frequência",
      band: "Banda",
      ip: "Endereço IP",
      subnet: "Sub-rede",
      ssid: "Nome da rede",
      connected: "Conectado",
      disconnected: "Não conectado ao Wi-Fi",
      hidden: "Rede oculta",
      cellular: "Conectado por dados móveis",
      otherNetwork: "Conectado a uma rede não Wi-Fi",
    },
    signal: {
      excellent: "Excelente",
      good: "Boa",
      fair: "Regular",
      weak: "Fraca",
      poor: "Ruim",
    },
    networks: {
      title: "Redes próximas",
      empty: "Nenhuma rede encontrada",
      scanning: "Escaneando redes próximas...",
      iosNote:
        "O escaneamento de redes próximas requer permissão de localização para detectar redes Wi-Fi.",
    },
    channels: {
      title: "Análise de canais",
      low: "Baixo",
      medium: "Médio",
      high: "Alto",
    },
    unavailable: {
      title: "Sem Conexão",
      message:
        "Você não está conectado a nenhuma rede. Conecte-se ao Wi-Fi e tente novamente.",
    },
    error: {
      title: "Erro",
    },
    tip: "Redes de 5 GHz oferecem velocidades mais rápidas com menos interferência. Se seu sinal estiver fraco, tente se aproximar do roteador ou trocar de banda.",
    tracker: {
      title: "Rastreador de Sinal",
      trackSignal: "Rastrear Sinal",
      estimatedDistance: "Distância estimada",
      approximation: "Estimativa aproximada",
      graphTitle: "Histórico do sinal",
      graphWaiting: "Coletando dados do sinal...",
      min: "Mín",
      max: "Máx",
    },
  },

  // Camera Detector
  cameraDetector: {
    title: "Detector de Câmeras",
    subtitle: "Encontre câmeras Wi-Fi escondidas",
    entryTitle: "Detector de Câmeras",
    entrySubtitle: "Procure câmeras Wi-Fi escondidas ao seu redor",
    scanButton: "Iniciar varredura",
    rescanButton: "Escanear novamente",
    scanning: "Procurando dispositivos ao redor...",
    hiddenSsid: "Rede oculta",
    footer:
      "Esta ferramenta reduz o risco, não dá garantia. Nenhum app detecta toda câmera — combine com uma busca física (reflexo de lente, furos suspeitos, objetos fora do lugar).",
    intro: {
      title: "Procure câmeras escondidas",
      body: "Câmeras espiãs em quartos de hotel e Airbnbs quase sempre usam Wi-Fi. Esta varredura ajuda a localizá-las usando os sensores do seu telefone.",
      disclaimer:
        "Resultado honesto: sinalizamos dispositivos suspeitos, nunca afirmamos 'você está seguro'. Um roteador comum também pode aparecer — use o bom senso.",
      tips: {
        wifi: {
          title: "Câmeras com Wi-Fi próprio",
          body: "Detectamos e localizamos por proximidade as câmeras que emitem a própria rede.",
        },
        network: {
          title: "Câmeras na rede do local",
          body: "Procuramos câmeras já conectadas ao Wi-Fi (portas RTSP/ONVIF). Detecta presença, não a localização.",
        },
        physical: {
          title: "Busca física",
          body: "Confira reflexos de lente, tomadas, detectores de fumaça e objetos apontados para a cama.",
        },
      },
    },
    suspicion: {
      high: "Alta suspeita",
      medium: "Suspeita média",
      low: "Baixa suspeita",
      none: "Comum",
    },
    reasons: {
      knownVendor: "Fabricante de câmera",
      ssidPattern: "Nome suspeito",
      hiddenSsid: "Rede oculta",
      openNetwork: "Rede aberta",
      strongSignalClose: "Sinal muito forte (perto)",
    },
    results: {
      suspectsTitle: "APs próximos suspeitos",
      suspectsSubtitle:
        "Ordenados por suspeita e sinal. Toque para caçar por proximidade.",
      noSuspects:
        "Nenhuma rede próxima encontrada. Ative o Wi-Fi e a localização e tente de novo.",
      networkTitle: "Câmeras na rede",
      networkSubtitle:
        "Procura câmeras conectadas ao Wi-Fi atual (precisa estar conectado à mesma rede).",
      networkScanButton: "Escanear a rede",
      networkRescan: "Escanear de novo",
      networkScanning: "Varrendo a rede...",
      networkNone: "Nenhum dispositivo parecido com câmera encontrado na rede.",
      networkUnavailable:
        "Indisponível agora. Conecte-se a um Wi-Fi — e este recurso é ativado após atualizar o app.",
      networkError: "Não foi possível varrer a rede. Tente novamente.",
    },
    hostKind: {
      camera: "Possível câmera",
      nvr: "Possível gravador (NVR/DVR)",
      generic: "Dispositivo com porta de câmera",
    },
    host: {
      ports: "Portas",
    },
    hunt: {
      estimatedDistance: "Distância estimada",
      approximation: "Estimativa aproximada por RSSI",
      rssiTitle: "Sinal ao vivo",
      back: "Voltar à lista",
      throttleNote:
        "O Android limita a frequência das leituras de Wi-Fi, então a distância atualiza a cada poucos segundos. Ande devagar para sentir o sinal esquentar ou esfriar.",
      guidance: {
        near: "🔥 Muito perto — procure aqui!",
        medium: "Esquentando — continue andando.",
        far: "Frio — afaste-se nessa direção.",
        unknown: "Procurando o sinal...",
      },
    },
    errors: {
      locationOff: {
        title: "Ative a localização",
        message:
          "O Android exige localização ligada para escanear redes Wi-Fi próximas.",
      },
      notAndroid: {
        title: "Apenas no Android",
        message:
          "A varredura de Wi-Fi só está disponível no Android. O iOS não permite esse acesso.",
      },
      scanFailed: {
        title: "Falha na varredura",
        message: "Não foi possível escanear as redes. Tente novamente.",
      },
      openSettings: "Abrir configurações",
      retry: "Tentar novamente",
    },
  },

  // Common
  common: {
    close: "Fechar",
    cancel: "Cancelar",
    loading: "Carregando...",
    retry: "Tentar novamente",
    unknownDevice: "Dispositivo Desconhecido",
    unknown: "Desconhecido",
  },
  splash: {
    tagline: "detectar · analisar · proteger",
  },
};
