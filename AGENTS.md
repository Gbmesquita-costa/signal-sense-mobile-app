# AGENTS.md

Instructions for AI coding agents (Codex, Claude Code, Cursor, ...) working on
Signal Sense. `CLAUDE.md` holds the longer project guide; this file is the
short checklist every agent must follow.

## Setup and checks

```bash
npm ci                 # clean install from package-lock.json
npm run typecheck      # must pass
npm run lint           # must pass with no errors
npm test               # must pass
```

Use `npx expo install <pkg>` for Expo or native dependencies, and confirm
versions with `npm view <pkg> version` instead of guessing.

## Where code goes

| Layer        | Folder        | Rule                                                   |
| ------------ | ------------- | ------------------------------------------------------ |
| Screens      | `app/`        | Expo Router routes; compose hooks and components only  |
| UI           | `components/` | Presentational, NativeWind styles, no native calls     |
| React glue   | `hooks/`      | Lifecycle, permissions, wiring services to stores      |
| Shared state | `stores/`     | Zustand, minimal state, narrow selectors               |
| Domain       | `services/`   | One folder per feature, public API via `index.ts`      |
| Utilities    | `lib/`        | i18n (pt-BR, en, es) and navigation helpers            |

Pure algorithms (RSSI filters, distance conversion, tracker and camera
heuristics) stay free of React and native imports and get unit tests in a
sibling `__tests__/` folder. Native modules are mocked in `jest.setup.ts`.

## Platform constraints

- Android only. BLE uses `react-native-ble-plx`; Wi-Fi uses NetInfo and
  `react-native-wifi-reborn`; the magnetometer uses `expo-sensors`.
- Wi-Fi scans are throttled by Android 9+: 4 scans per 2 minutes in the
  foreground, 1 per 30 minutes in the background. Results beyond that are
  cached, so do not design features that assume faster fresh scans.
- Wi-Fi scanning needs location permission and Location turned on; BLE
  scanning needs location permission on Android 11 and below.
- Everything is offline and on-device. Do not add network calls that send
  scan data anywhere.

## Commit rules

- Branch: `staging`. Do not push to `main`, force-push or rewrite history.
- Conventional Commits in English with a short body explaining why.
- One logical change per commit; run all checks before committing.
- Stage files explicitly and review `git diff --cached` before committing.
- Never commit `.env*` (except `.env.example`), keystores, service account
  files, tokens, `node_modules/`, `/android`, `/ios`, `.expo/`, `coverage/`,
  `playwright-report/` or `test-results/`.
- Keep docs truthful: mark mocked, experimental or premium-only behaviour.
