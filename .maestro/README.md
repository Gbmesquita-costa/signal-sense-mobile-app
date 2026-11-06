# End-to-end flows (Maestro)

These flows drive the real Android app through the UI. They are smoke tests
for navigation only: they do not scan BLE or Wi-Fi, and they do not check any
detection result.

Signal Sense is a native Android app, so browser tools such as Playwright
cannot drive it. [Maestro](https://maestro.dev) talks to the Android UI
directly, which is why it is used here.

The flows are **not run in CI**. They need an emulator or a phone with the app
installed, and they have not been run on a device in this repository yet.

## Flows

| Flow                     | What it checks                                         |
| ------------------------ | ------------------------------------------------------ |
| `flows/01-launch.yaml`   | App opens on the Scan tab with the header actions      |
| `flows/02-tabs.yaml`     | Each tab can be selected by tapping it                 |
| `flows/03-settings.yaml` | Settings opens from the header and closes again        |
| `flows/04-paywall.yaml`  | Paywall opens from `signalsense://paywall` and closes  |

Elements are found by `testID`, so the flows work in any app language.
The paywall flow uses a deep link because development builds force premium
on, which hides the "Unlock Premium" row in Settings.

## Running them

1. Install the Maestro CLI: <https://docs.maestro.dev/getting-started/installing-maestro>
2. Start an Android emulator (or connect a phone with USB debugging) and check
   that `adb devices` lists it.
3. Install a build of the app (`com.signalsense.app`), either:
   - a dev client: `npm run android`, then keep Metro running
     (`npm run dev:client`) so the app can load its bundle, or
   - a preview APK from EAS: `eas build --profile preview --platform android`.
4. Run all flows:

   ```bash
   npm run e2e
   ```

   or a single one: `maestro test .maestro/flows/03-settings.yaml`.

`maestro check-syntax <flow>` validates a flow file without a device.

The launch flow uses `clearState`, so it wipes the app's local data (history,
trusted devices, settings) on the target device.
