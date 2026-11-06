# 📡 Signal Sense — App Mobile

<div align="center">

![Expo](https://img.shields.io/badge/Expo_SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native_0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Reanimated](https://img.shields.io/badge/Reanimated_4-001A72?style=for-the-badge&logo=react&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

**Transforme seu telefone num detector dos sinais invisíveis ao seu redor — Bluetooth, Wi-Fi, campo magnético — e encontre câmeras escondidas. 100% offline, sem servidor, sem coleta de dados.**

[🚀 Começar](#-como-executar) • [🏗️ Arquitetura](#️-arquitetura) • [🧩 Módulos](#-módulos-e-lógica-de-cada-feature) • [🔐 Privacidade](#-privacidade)

</div>

---

## 📋 Sumário

- [📖 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Diferenciais](#-diferenciais)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Como Executar](#-como-executar)
- [🏗️ Arquitetura](#️-arquitetura)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🧩 Módulos e Lógica de Cada Feature](#-módulos-e-lógica-de-cada-feature)
- [📈 O Motor de Proximidade (RSSI → distância)](#-o-motor-de-proximidade-rssi--distância)
- [🕵️ Detector de Câmeras](#-detector-de-câmeras)
- [🧭 AR Signal Finder (experimental)](#-ar-signal-finder-experimental)
- [💎 Modelo Premium](#-modelo-premium)
- [🌍 Internacionalização](#-internacionalização)
- [🎨 Tema e UX](#-tema-e-ux)
- [🔐 Privacidade](#-privacidade)
- [📚 Scripts Disponíveis](#-scripts-disponíveis)
- [✅ Testes, CI/CD e fluxo de branches](#-testes-cicd-e-fluxo-de-branches)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 Licença](#-licença)

---

## 📖 Sobre o Projeto

O **Signal Sense** é uma ferramenta de **privacidade pessoal** que usa os **sensores reais do telefone** para revelar o mundo invisível ao seu redor: dispositivos **Bluetooth Low Energy**, redes **Wi-Fi**, variações de **campo magnético** — e, principalmente, **câmeras escondidas** em locais como Airbnbs, hotéis e banheiros.

O produto nasceu de uma dor real: a insegurança de quem suspeita estar sendo filmado em ambientes privados. A filosofia é de **honestidade radical** — o app não promete "ver através de paredes" nem garante achar toda câmera; ele entrega **consciência** baseada na física do que os sensores conseguem medir, e **educa** o usuário no processo.

> Foco em **Android**, onde há acesso completo às APIs de BLE e Wi-Fi. Todo o processamento é **local**: não existe backend.

---

## ✨ Diferenciais

- **📶 Sensores reais** — BLE, Wi-Fi e magnetômetro de verdade; sem simulações
- **🔌 100% offline** — sem servidor, sem login, sem nuvem; dados em SQLite local
- **🧭 Honestidade técnica** — explica limites e nunca diz "você está seguro"
- **🕵️ Detector de Câmeras** — pilar Premium que combina proximidade por Wi-Fi + varredura de rede
- **🛡️ Anti-Rastreamento** — detecção de AirTag/Tile/SmartTag te seguindo, em segundo plano
- **🎓 Educativo** — cada métrica vem com explicação (RSSI, dBm, bandas, interferência)
- **🌍 Trilíngue** — Português (BR), English e Español
- **💳 Compra única** — Premium sem assinatura, com preço regional via Google Play

---

## 🛠️ Tecnologias

### Core

- **[Expo SDK 54](https://expo.dev/)** + **[React Native 0.81](https://reactnative.dev/)** — base do app (New Architecture + Hermes)
- **[React 19](https://react.dev/)** + **[React Compiler](https://react.dev/learn/react-compiler)** — UI com otimização automática de re-render
- **[TypeScript](https://www.typescriptlang.org/)** — tipagem estática
- **[Expo Router 6](https://docs.expo.dev/router/introduction/)** — navegação por arquivos (file-based routing)

### Estilo e Animações

- **[NativeWind 4](https://www.nativewind.dev/)** + **[Tailwind CSS 3](https://tailwindcss.com/)** — estilos utilitários no RN
- **[Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)** + **[react-native-worklets](https://github.com/margelo/react-native-worklets-core)** — animações na UI thread
- **[Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** + **[@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/)** — gestos e bottom sheets
- **[Lucide RN](https://lucide.dev/)** · **[expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)** · **[react-native-svg](https://github.com/software-mansion/react-native-svg)** · **[gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)**

### Sensores e Sinais

- **[react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)** — scan Bluetooth Low Energy
- **[react-native-wifi-reborn](https://github.com/JuanSeBestia/react-native-wifi-reborn)** — redes Wi-Fi próximas
- **[@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo)** — conexão Wi-Fi atual
- **[expo-sensors](https://docs.expo.dev/versions/latest/sdk/sensors/)** — magnetômetro e DeviceMotion (orientação + passos no AR Signal Finder)
- **[expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/)** — prévia ao vivo do AR Signal Finder (nada é gravado)
- **[react-native-tcp-socket](https://github.com/Rapsssito/react-native-tcp-socket)** — scan de portas da rede (Detector de Câmeras, Tipo B)
- **[expo-location](https://docs.expo.dev/versions/latest/sdk/location/)** — exigência do Android para scan de BLE/Wi-Fi

### Dados, Estado e Background

- **[Zustand 5](https://zustand-demo.pmnd.rs/)** — estado global (scan, premium, anti-stalking)
- **[expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)** — histórico local
- **[expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)** + **[expo-task-manager](https://docs.expo.dev/versions/latest/sdk/task-manager/)** — alertas e scan em segundo plano

### Premium e i18n

- **[react-native-purchases](https://www.revenuecat.com/)** (RevenueCat) — compra única do Premium
- **[i18next](https://www.i18next.com/)** + **[react-i18next](https://react.i18next.com/)** + **[expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/)** — trilíngue

---

## 🚀 Como Executar

### 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Android Studio](https://developer.android.com/studio) (SDK + ADB) e **JDK 17**
- Um **dispositivo Android** (com Depuração USB ativada) ou um **emulador**
- Como o app usa **módulos nativos**, ele roda num **dev client** (não no Expo Go)

### 🔧 Instalação

1. **Clone e instale**

```bash
git clone https://github.com/seu-usuario/signal-sense-mobile-app.git
cd signal-sense-mobile-app
npm install
```

> ⚠️ Use sempre `npx expo install <pacote>` para adicionar dependências — evita podar deps transitivas/peer (ex.: `babel-preset-expo`, `react-native-worklets`). Não use `npm install <pkg> --legacy-peer-deps` de forma incremental.

2. **Gere os projetos nativos** (Continuous Native Generation)

```bash
npx expo prebuild
```

3. **Compile e rode no dispositivo** (cabo USB ou emulador)

```bash
npx expo run:android          # build de debug
# ou, para sentir a velocidade real de produção:
npx expo run:android --variant release
```

4. **Dia a dia** (após o app instalado, sem cabo, via Wi-Fi)

```bash
npx expo start --dev-client
```

> 🔁 **Quando precisa rebuildar?** Só quando muda **código/config nativos** (novas libs nativas, permissões, splash). Mudanças de JS (telas, lógica, i18n) recarregam na hora pelo `expo start`.

---

## 🏗️ Arquitetura

O app separa **rotas** (UI/telas) de **serviços** (lógica de domínio), com hooks fazendo a ponte e Zustand guardando o estado global.

```
┌───────────────────────────────────────────────────────────────┐
│  app/  (Expo Router — telas e navegação por arquivos)          │
│        (tabs): scan · proximity · wifi · environment · education│
│        + camera-detector · device/[id] · history · settings ·  │
│          paywall                                               │
├───────────────────────────────────────────────────────────────┤
│  hooks/  (ponte UI ↔ serviços: useScan, useProximity, useWifi, │
│           useEnvironment, useCameraDetector, useAntiStalking…)  │
├───────────────────────────────────────────────────────────────┤
│  services/  (lógica de domínio, isolada e testável)            │
│   scan · proximity · environment · wifi · camera-detector ·    │
│   tracker · stalker · history · notification · premium · export│
├───────────────────────────────────────────────────────────────┤
│  stores/ (Zustand)   theme/ (ThemeContext)   lib/i18n (i18next) │
├───────────────────────────────────────────────────────────────┤
│  Sensores nativos: BLE · Wi-Fi · Magnetômetro · TCP · SQLite    │
└───────────────────────────────────────────────────────────────┘
```

### Princípios

- **Serviços puros**: cada domínio (`services/<dominio>`) concentra a lógica (managers, conversores, detectores), sem depender de React — fácil de raciocinar e reusar.
- **Hooks como adaptadores**: cada `use<Feature>` orquestra um serviço e expõe estado/ações para a tela.
- **Estado global enxuto**: Zustand só para o que é compartilhado entre telas (dispositivo selecionado, premium, anti-stalking).
- **Reuso do motor de RSSI**: BLE e Wi-Fi compartilham o mesmo cálculo de distância (`services/proximity/rssi.converter`).

---

## 📁 Estrutura do Projeto

```
.
├── 📂 app/                          # Rotas (Expo Router)
│   ├── 📂 (tabs)/                   # Abas principais
│   │   ├── scan.tsx                 # Scan BLE
│   │   ├── proximity.tsx            # Proximidade de um dispositivo
│   │   ├── wifi.tsx                 # Wi-Fi + Signal Tracker
│   │   ├── environment.tsx          # Magnetômetro
│   │   ├── education.tsx            # Centro de conhecimento
│   │   └── _layout.tsx              # Barra de abas + header
│   ├── camera-detector.tsx          # ⭐ Detector de Câmeras (tela dedicada)
│   ├── ar-finder.tsx                # ⭐ AR Signal Finder (experimental)
│   ├── device/[id].tsx              # Detalhe/perfil de dispositivo
│   ├── history.tsx · settings.tsx · paywall.tsx
│   ├── index.tsx                    # Redireciona para /scan
│   └── _layout.tsx                  # Stack raiz + splash + DB init
│
├── 📂 services/                     # Lógica de domínio
│   ├── scan/                        # ble.manager · rssi.processor · types
│   ├── proximity/                   # proximity.manager · rssi.converter
│   ├── environment/                 # leitura do magnetômetro
│   ├── wifi/                        # wifi.service (NetInfo + reborn)
│   ├── camera-detector/             # ⭐ detector + wifi-proximity + network-scanner
│   ├── signal-compass/              # sessão do AR Signal Finder (sensores + scans)
│   ├── tracker/                     # detecção AirTag/Tile/SmartTag (OUI/UUID)
│   ├── stalker/                     # anti-rastreamento em background
│   ├── history/                     # sessões em SQLite
│   ├── notification/                # push (expo-notifications)
│   ├── premium/                     # RevenueCat + feature flags
│   └── export/                      # exportação CSV
│
├── 📂 domain/                       # algoritmos puros: sensors/ (magnetômetro) e signal-compass/ (AR)
├── 📂 hooks/                        # useScan, useProximity, useWifi, …
├── 📂 stores/                       # useScanStore · usePremiumStore · useAntiStalkingStore
├── 📂 components/                   # UI por feature (+ AnimatedSplashScreen, Card…)
├── 📂 lib/i18n/                     # i18next + locales/{pt-BR,en,es}.ts
├── 📂 theme/                        # ThemeContext + colors
└── 📄 app.json                      # Config Expo (plugins, splash, permissões)
```

---

## 🧩 Módulos e Lógica de Cada Feature

### 📡 Scan BLE

Escaneia dispositivos **Bluetooth Low Energy** ao redor em tempo real (`react-native-ble-plx`), ordenados por intensidade de sinal. O `tracker.detector` analisa cada dispositivo por **company-id do fabricante**, **service UUIDs** e **padrões de nome** para sinalizar rastreadores conhecidos (AirTag, Tile, SmartTag, Chipolo). Toque num dispositivo para acompanhá-lo na **Proximidade**.

### 🎯 Proximidade

Acompanha um dispositivo selecionado e estima **a distância** conforme você se move. Usa o **motor de RSSI** (veja a seção dedicada): suavização EMA, calibração automática de TX power e fator de ambiente com histerese. Mostra nível (perto/médio/longe), distância, gráfico de RSSI ao vivo (Premium) e um **watchdog** que avisa quando o sinal é perdido.

### 🧲 Ambiente (Magnetômetro)

Lê o **campo magnético em 3 eixos** (`expo-sensors`) em microteslas (µT). Detecta interferências de motores, ímãs e estruturas metálicas. Status com **histerese** (evita oscilação), animação a 60 FPS e feedback háptico.

### 📶 Wi-Fi

Mostra a **conexão atual** (SSID, banda 2.4/5/6 GHz, IP, qualidade) via NetInfo, e — no Premium — **redes próximas** e **análise de canais** (`react-native-wifi-reborn`). Inclui o **Signal Tracker**: um radar com estimativa de distância ao roteador conectado.

### 🛡️ Anti-Rastreamento

Monitora dispositivos BLE em **segundo plano** (`expo-task-manager`). Se um dispositivo desconhecido te acompanha por **15+ minutos**, dispara um **alerta push** (`expo-notifications`). Suporta lista de **dispositivos confiáveis** que não geram alerta.

### 🕵️ Detector de Câmeras ⭐

Pilar Premium para achar câmeras Wi-Fi escondidas — veja a [seção dedicada](#-detector-de-câmeras).

### 🧭 AR Signal Finder ⭐ (experimental)

Aponte a câmera e siga as ondas até uma rede Wi-Fi escolhida — veja a [seção dedicada](#-ar-signal-finder-experimental).

### 🎓 Educação

Centro de conhecimento com tópicos didáticos (RSSI, BLE, bandas Wi-Fi, magnetômetro, interferência, limites). Abre num **bottom sheet** (`@gorhom/bottom-sheet`) com efeito de cortina e arrastar-para-fechar.

### 🕘 Histórico

Sessões de proximidade e Wi-Fi salvas localmente em **SQLite** (`expo-sqlite`). No Premium, histórico ilimitado e **exportação CSV**.

---

## 📈 O Motor de Proximidade (RSSI → distância)

O coração da estimativa de distância está em **`services/proximity/rssi.converter.ts`** — matemática pura de dBm, reutilizada tanto por **BLE** quanto por **Wi-Fi**:

1. **Suavização EMA** do RSSI bruto (estável, mas responsivo).
2. **Calibração automática de TX Power** — usa a mediana do histórico para robustez contra outliers.
3. **Modelo de path-loss**: `distância = 10 ^ ((txPower − rssi) / (10 × n))`.
4. **Fator de ambiente (n) com histerese** — transições suaves, sem "pular" entre faixas.
5. **EMA na distância final** — evita _jitter_ no número exibido.

> Honestidade: mesmo com calibração, é uma **estimativa**. O valor relativo (esquentar/esfriar conforme você anda) é mais confiável que o número absoluto.

---

## 🕵️ Detector de Câmeras

Câmeras espiãs quase sempre usam Wi-Fi. O detector ataca os **dois tipos**, com honestidade sobre o que cada técnica alcança:

### Tipo A — câmera com Wi-Fi próprio (localizável)

Câmeras em modo AP **emitem a própria rede**. O `cameraDetector` classifica cada AP escaneado por **OUI do fabricante** (prefixo do BSSID), **padrões de SSID** e heurísticas (rede oculta, aberta, sinal muito forte). Ao selecionar um AP suspeito, o **`WifiProximityManager`** reusa o motor de RSSI para uma **caça por proximidade** ("esquenta/esfria") — funciona sem rebuild.

### Tipo B — câmera cliente na rede (presença)

Câmeras conectadas ao Wi-Fi do local não emitem beacon próprio. O **`networkScanner`** deriva a sub-rede `/24` e faz um **port-scan TCP** (`react-native-tcp-socket`) das portas típicas de câmera (RTSP 554, ONVIF, Dahua/NVR), lendo o **banner HTTP** para identificar o fabricante. Detecta **presença e identidade**, não a localização por RF.

> ⚙️ O Tipo B depende do módulo nativo `react-native-tcp-socket`; até o app ser recompilado, a seção exibe "disponível após atualizar" e o Tipo A continua funcionando normalmente. A leitura de ARP/MAC de clientes **não** é viável no Android sem root.

---

## 🧭 AR Signal Finder (experimental)

> **MVP experimental.** Os algoritmos têm testes unitários com caminhadas simuladas, mas o recurso **ainda não foi validado em campo** num celular real. Trate a direção como uma pista.

Na aba Wi-Fi, o card **AR Signal Finder** (ou o ícone de radar em cada rede da lista) abre a tela `app/ar-finder.tsx`: a câmera traseira mostra a imagem ao vivo e uma sobreposição desenha **ondas que fluem na direção estimada** do ponto de acesso escolhido, com seta na borda quando ele está fora do campo de visão, cor pela força do sinal, distância e confiança estimadas e vibração leve quando o sinal fica mais forte.

**Como a direção é estimada (tudo no aparelho, sem rede e sem servidor):**

1. **Pose da câmera** — `DeviceMotion` (rotation vector do Android: giroscópio + acelerômetro + magnetômetro) vira rumo e inclinação do eixo da câmera (`domain/signal-compass/orientation.ts`).
2. **Passos** — detector de passos sobre a aceleração linear + _dead reckoning_ com passada fixa de 0,7 m.
3. **Filtro de partículas** — cada partícula é uma hipótese (posição da fonte, potência a 1 m). Cada leitura de RSSI é pontuada pelo modelo log-distance `rssi = tx − 10·n·log10(d)` a partir da posição em que você estava. De um ponto só, qualquer direção explica a leitura; por isso a **confiança fica em 0 até você andar** e a tela pede alguns passos para calibrar.
4. **Entre scans** a seta continua acompanhando seus passos e giros, porque o rumo é recalculado da sua posição atual.
5. **Projeção** — modelo _pinhole_ com campo de visão aproximado (50°×65° em retrato; o real varia por aparelho).

**Limites reais, sem maquiagem:**

- **Não precisa se conectar à rede**: usa os resultados de scan, que listam todos os pontos de acesso ao alcance. Precisa de permissão de localização e da Localização ligada.
- **O Android limita scans de Wi-Fi** (4 a cada 2 minutos em primeiro plano). O app pede scans novos só dentro desse orçamento (`services/wifi/scan-budget.ts`) e, entre eles, lê o cache; resultados repetidos (mesmo `timestamp`) não são contados de novo. Na prática as leituras chegam a cada vários segundos.
- **BLE atualizaria bem mais rápido** (vários anúncios por segundo) e o estimador não depende da fonte, mas nesta versão o AR Signal Finder só localiza **redes Wi-Fi**.
- Paredes, pessoas e reflexões quebram o modelo de propagação; o campo de visão e a passada são aproximações. Nos testes simulados (`domain/signal-compass/__tests__`), o erro mediano de direção fica abaixo de 30° após uma caminhada em L de ~14 m, inclusive com ambiente mais atenuante do que o modelo assume.
- A câmera serve **só para a prévia**: nada é gravado nem enviado, e o plugin do `expo-camera` não pede permissão de microfone.

---

## 💎 Modelo Premium

- **Compra única** (sem assinatura), com **preço regional** via Google Play, gerenciada pelo **RevenueCat** (`react-native-purchases`).
- O gating é feito pelo componente **`PremiumGate`** + a store `usePremiumStore`, com chaves de feature tipadas em `services/premium/premium.types.ts`.
- **Grátis:** Scan BLE, Proximidade, Ambiente e Wi-Fi (conexão atual), Educação, tema e idiomas.
- **Premium:** histórico ilimitado, perfis de dispositivo, **detecção de rastreadores**, gráfico RSSI ao vivo, Anti-Rastreamento avançado, análise de redes/canais Wi-Fi, **Detector de Câmeras**, **AR Signal Finder** (experimental) e exportação CSV.

---

## 🌍 Internacionalização

- **Idiomas:** `pt-BR`, `en`, `es` (i18next + `expo-localization` detecta o idioma do dispositivo).
- **Persistência:** a escolha fica em `AsyncStorage`.
- **Conteúdo:** chaves em `lib/i18n/locales/{pt-BR,en,es}.ts` — **mesma estrutura de chaves** nos três arquivos (nada hardcoded na UI; tudo via `t(...)`).

---

## 🎨 Tema e UX

- **Tema** claro/escuro/sistema via `ThemeContext` — atualização **síncrona** + persistência em background (sem travar a UI).
- **Splash animada** ("Signal Awakening") que respeita o tema; splash nativo configurado com fundo claro **e** escuro.
- **Hápticos** em mudanças de nível/ações importantes; transições com Reanimated na UI thread.

---

## 🔐 Privacidade

- **Sem servidor / sem backend** — não há para onde enviar dados.
- **Sem coleta** — zero analytics, telemetria ou crashlytics.
- **Sem login** — abra e use.
- **Armazenamento local** — todo histórico fica em SQLite no aparelho; some ao desinstalar.

---

## 📚 Scripts Disponíveis

```bash
npm start              # Expo (dev server)
npm run dev:client     # Expo com dev client (recomendado)
npm run android        # expo run:android (build + instala)
npm run pre:build      # expo prebuild (gera android/ ios/)
npm run devices        # adb devices (lista aparelhos conectados)
npm run generate:icons # gera os ícones Android
npm run lint           # expo lint
npm run typecheck      # tsc --noEmit
npm test               # Jest (jest-expo)
npm run test:coverage  # cobertura em coverage/ (ignorado pelo git)
npm run e2e            # fluxos Maestro (precisa de emulador/aparelho)
```

---

## ✅ Testes, CI/CD e fluxo de branches

- **Testes unitários (Jest + jest-expo):** algoritmos puros em `domain/` (filtros do magnetômetro, estimador do AR Signal Finder com caminhadas simuladas, projeção, passos), serviços (RSSI, rastreadores, anti-stalking, detector de câmeras, Wi-Fi, premium, sessão do AR) e hooks. Módulos nativos são mockados em `jest.setup.ts`.
- **E2E (Maestro):** fluxos em `.maestro/flows` para abrir o app, abas, ajustes e paywall. Rodam localmente com emulador/aparelho (`npm run e2e`) e **não** rodam no CI. Veja `.maestro/README.md`.
- **CI (`.github/workflows/ci.yml`):** lint, typecheck e Jest em todo push e pull request para `main` e `staging`.
- **Deploy (`.github/workflows/deploy.yml`):** depois do CI, um push em `staging` publica um EAS Update no canal `staging` e um push em `main` no canal `production`. Builds nativos só rodam manualmente (workflow_dispatch). Precisa do secret `EXPO_TOKEN` e do project id do EAS; sem eles os jobs são pulados com aviso. As atualizações OTA ainda dependem de instalar `expo-updates` e configurar `updates.url` (`eas update:configure`), o que **ainda não foi feito**.
- **Fluxo de branches:** o trabalho acontece em `staging` (cada commit passa por lint, typecheck e testes); a `main` só recebe merges revisados de `staging`, sem force-push.

---

## 🐛 Troubleshooting

#### `Cannot find module 'babel-preset-expo'` (Metro) ou erro do `react-native-worklets` no build

Dependências transitivas/peer foram podadas. **Corrija com Expo install:**

```bash
npx expo install babel-preset-expo react-native-worklets
```

#### `adb devices` vazio (Windows)

Quase sempre é **driver USB do fabricante** ou **cabo só de carga**. Ative a **Depuração USB**, use cabo de dados e autorize o pop-up de RSA no celular.

#### Mudei lib nativa / permissão / splash e não aplicou

Rode um **rebuild**: `npx expo prebuild && npx expo run:android`. Mudanças de JS não precisam disso.

#### Scan de Wi-Fi/BLE não retorna nada

O Android exige **localização ligada** (serviços de localização) para esses scans, além da permissão concedida.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Signal Sense — detectar · analisar · proteger** 📡

Feito por [Gabriel Mesquita](https://www.gmesquita.dev)

</div>
