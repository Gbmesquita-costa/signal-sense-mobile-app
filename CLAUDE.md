# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

Signal Sense is an Android-only Expo app (SDK 54, React Native 0.81, new
architecture, Hermes, React Compiler) that surfaces nearby BLE devices, Wi-Fi
networks and magnetic-field changes to raise privacy awareness, including a
heuristic hidden-camera finder and tracker (AirTag/Tile/SmartTag) detection.
Everything runs on-device: there is no backend; data is stored in local SQLite.
Premium features are gated through RevenueCat (`react-native-purchases`).

The product never claims certainty. Copy, docs and code comments must describe
results as estimates ("possible tracker", "signal is getting stronger"), never
as guarantees ("you are safe", "camera found").

## Commands

```bash
npm install            # install deps (package-lock.json is the source of truth)
npx expo install <pkg> # add Expo / native packages with SDK-compatible versions
npm run dev:client     # start Metro for the dev client build
npm run android        # local native build + run (generates /android, not committed)
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint (eslint-config-expo, flat config)
npm test               # Jest with the jest-expo preset
npm run test:coverage  # coverage report in coverage/ (git-ignored)
npm run e2e            # Maestro UI flows; needs an emulator/device (see .maestro/README.md)
```

Run `npm run typecheck`, `npm run lint` and `npm test` before every commit.

Builds and OTA updates go through EAS (`eas.json`):

| Profile       | Output                 | Update channel |
| ------------- | ---------------------- | -------------- |
| `development` | dev client APK         | `development`  |
| `preview`     | internal APK           | `staging`      |
| `production`  | app bundle (Play)      | `production`   |

GitHub Actions:

- `ci.yml` – lint, typecheck and Jest on every push and pull request to
  `main` and `staging`.
- `deploy.yml` – after the CI checks pass, a push to `staging` publishes an
  EAS Update to the `staging` channel and a push to `main` to `production`.
  Native builds only run by hand (workflow_dispatch, choose a profile);
  production builds are auto-submitted to the Play internal track. Never runs
  on pull requests. Needs the `EXPO_TOKEN` secret and an EAS project id in
  `app.json` (`eas init`); without them the jobs skip with a notice. OTA
  updates also need `expo-updates` installed and `updates.url` set
  (`eas update:configure`), which is not done yet.
- `dependabot.yml` – weekly npm and Actions update PRs against `staging`
  (active once the file is on `main`, GitHub's default branch).

Maestro UI flows live in `.maestro/` and are not run in CI (they need a
device); see `.maestro/README.md`.

## Architecture

Layers, from the outside in. Dependencies only point downwards.

1. **`app/`** – Expo Router screens and layouts (`(tabs)/`, `device/`,
   `paywall.tsx`, ...). Screens compose components and hooks; no direct native
   module calls and no business logic.
2. **`components/`** – presentational UI grouped by feature (`scan/`, `wifi/`,
   `environment/`, `stalker/`, `premium/`, ...). Styled with NativeWind
   classes and `theme/`. Props in, callbacks out.
3. **`hooks/`** – React glue (`useScan`, `useWifi`, `useCameraDetector`,
   `useEnvironment`, ...). Own lifecycles (start/stop, AppState, cleanup on
   unmount) and connect services to stores.
4. **`stores/`** – Zustand stores for state shared across screens (scan,
   premium, anti-stalking). Keep them minimal and use narrow selectors.
5. **`services/`** – framework-agnostic domain logic, one folder per feature,
   exposed through its `index.ts`:
   - `scan/` BLE manager (`react-native-ble-plx`) and RSSI processing
   - `proximity/` RSSI to distance/level conversion
   - `wifi/` connection info (NetInfo) and nearby scan (`react-native-wifi-reborn`)
   - `camera-detector/` Wi-Fi proximity + network heuristics for possible cameras
   - `tracker/`, `stalker/` tracker signatures, follow detection, background task
   - `environment/` magnetometer (`expo-sensors`)
   - `signal-compass/` AR Signal Finder session: device motion + budgeted
     Wi-Fi scans of one BSSID fed into `domain/signal-compass`
   - `database/`, `history/`, `export/`, `notification/`, `premium/`

   Pure algorithms (filters, converters, detectors) must not import React or
   native modules so they can be unit tested directly.
6. **`domain/`** – pure, framework-free algorithms shared by services.
   `domain/sensors/` holds the magnetometer filter pipeline (outlier gate,
   rolling median, time-constant EMA, motion-aware magnitude smoothing) used
   by `services/environment`. `domain/signal-compass/` holds the AR Signal
   Finder math: step detection, dead reckoning, camera pose, RSSI Kalman
   filter, the particle-filter bearing estimator and screen projection.
   Nothing here may import React, Expo or native modules.
7. **`lib/`** – cross-cutting helpers: `i18n/` (pt-BR, en, es) and navigation.

## Conventions

- TypeScript strict mode; import with the `@/` alias (`@/services/scan`).
- Types live next to their feature in `*.types.ts`.
- All user-facing strings go through i18next; add keys to all three locales.
- Tests live in `__tests__/` beside the code (`*.test.ts(x)`). Native modules
  are mocked in `jest.setup.ts`; extend the mocks there instead of per test.
- Keep render work low: throttle sensor/RSSI updates before they reach state.
- Environment variables must be prefixed `EXPO_PUBLIC_` to reach the bundle,
  which also means they are public. Document new ones in `.env.example`.

## Android Wi-Fi scan throttling

Android limits how often an app may trigger `WifiManager.startScan()`:

- Android 9+: a foreground app gets **4 scans per 2-minute window**.
- Background apps share **1 scan per 30 minutes**.
- Android 10+ allows disabling throttling only via Developer Options
  ("Wi-Fi scan throttling"), so never rely on that for users.
- Extra scan requests over the limit fail silently and the system keeps
  returning the last cached results.

Implications for this codebase:

- `wifiService.scanNearbyNetworks()` uses `loadWifiList()`, which returns the
  system's latest (possibly cached) results; it does not guarantee a fresh scan.
- Polling loops such as `services/camera-detector/wifi-proximity.manager.ts`
  must treat repeated identical results as "no new data", not as a stable
  signal, and must not expect more than about one fresh scan every 30 s.
- Scanning requires location permission and Location services turned on.
- Scan results are available without connecting to the network.

## Commits and branches

- Work on `staging`; `main` is only updated through reviewed merges.
- Never force-push or rewrite pushed history.
- Conventional Commits in English (`feat(wifi): ...`, `fix(scan): ...`,
  `test: ...`, `docs: ...`), one logical change per commit, with a short body
  explaining why.
- Every commit must pass typecheck, lint and tests.
- Never commit secrets (`.env*` other than `.env.example`, keystores, service
  account JSON), `node_modules/`, `/android`, `/ios`, `.expo/` or test reports.
- Docs must match the code: label mocked or experimental features as such.
