# Appium TypeScript Framework

A production-quality, scalable **Android mobile automation framework** built with TypeScript,
WebdriverIO, Appium 2, and UiAutomator2 — driving the [Android ApiDemos](https://github.com/appium/appium)
sample app as the application under test. Built as a Senior QA Automation / SDET portfolio piece
and interview demonstration; not a loose collection of scripts.

## Project Overview

The framework exercises a representative slice of native Android interactions — app launch,
navigation, text input, checkboxes, radio buttons, a date picker, alert dialogs, scrolling, swiping,
and long-press gestures — through a proper Page Object Model, centralized wait/gesture/screenshot
utilities, environment-driven configuration, Allure reporting, and a CI pipeline that boots a real
Android emulator on GitHub Actions.

## Architecture

```text
Test Specs (Mocha + Chai)
        ↓
   Page Objects  (HomePage, ViewsPage, TextFieldsPage, DateWidgetsPage, DialogsPage)
        ↓
    BasePage      (click, getText, setValue, waits, scrolling, screenshots)
        ↓
    WebdriverIO    (browser / element API)
        ↓
     Appium 2      (WebDriver protocol server)
        ↓
   UiAutomator2    (Android automation driver)
        ↓
  Android Emulator (ApiDemos app under test)
```

Supporting layers used throughout the stack above:

- **`src/config`** — environment resolution (`environment.ts`) and Appium capability building
  (`capabilities.ts`), entirely driven by environment variables — no machine-specific paths.
- **`src/utils`** — `WaitUtils` (condition-based waits, no `browser.pause()`), `GestureUtils`
  (swipe/long-press/drag-and-drop/scroll via Appium's modern `mobile:` gesture commands),
  `ScreenshotUtils` (named capture + Allure attachment), `FileUtils`, `Logger`.
- **`test/data`** — test data kept out of the specs (`testData.json`), typed via
  `src/types/framework.types.ts`.

## Project Structure

```text
appium-typescript-framework/
├── src/
│   ├── config/            environment.ts, capabilities.ts
│   ├── constants/          appConstants.ts
│   ├── pages/               BasePage, HomePage, ViewsPage, TextFieldsPage, DateWidgetsPage, DialogsPage
│   ├── utils/                WaitUtils, GestureUtils, ScreenshotUtils, FileUtils, Logger
│   └── types/                 framework.types.ts
├── test/
│   ├── specs/               navigation, textFields, checkbox, datePicker, dialog, gesture
│   └── data/                 testData.json
├── config/
│   ├── wdio.android.conf.ts  base config (assumes Appium already running — used in CI)
│   └── wdio.local.conf.ts    extends the base config, auto-starts Appium locally
├── .github/workflows/mobile-tests.yml
├── apps/                     ApiDemos-debug.apk (downloaded, not committed — see below)
├── reports/ · screenshots/ · logs/  (git-ignored output directories)
├── .mcp.json                  optional AI-assisted MCP integration (see below)
└── ...
```

> **Note on `ViewsPage`:** ApiDemos models Controls → "1. Light Theme" (Button/CheckBox) and
> "Radio Group" as their own trivial single-purpose activities. Giving each a dedicated Page Object
> would add indirection without benefit, so `ViewsPage` owns navigation through the whole "Views"
> family plus those widget interactions — a deliberate, documented simplification, not an oversight.

## Technology Stack

TypeScript · WebdriverIO 9 · Appium 2 · UiAutomator2 · Mocha · Chai 5 · npm · ESLint 9 (flat config) ·
Prettier · GitHub Actions · Allure Reporting.

### Version notes

- **UiAutomator2 driver is pinned to `4.2.9`.** As of this writing, `appium-uiautomator2-driver@5.0.0+`
  requires **Appium 3**, which is no longer compatible with the Appium 2 stack this framework targets.
  `4.2.9` is the last release whose peer dependency is `appium ^2.4.1`. Both `npm run appium:install-driver`
  and the CI workflow pin this version explicitly — installing the driver without a version (`appium driver
install uiautomator2`) will pull an Appium‑3‑only build and fail to load.
- To move this framework onto Appium 3 later, bump `appium` and drop the `@4.2.9` pin — no other code
  changes are required, since nothing here touches deprecated Appium 1 (`TouchAction`/JSONWP) APIs.

## AI-Assisted Automation (MCP)

This project ships `.mcp.json`, registering [`@wdio/mcp`](https://github.com/webdriverio/mcp) — the
official WebdriverIO Model Context Protocol server. It lets an MCP-aware AI assistant (Claude Code,
Claude Desktop, etc.) drive a live WebdriverIO/Appium session against the emulator directly: useful for
interactively exploring ApiDemos screens, discovering locators, or debugging a flaky step, as a
complement to the static Mocha suite (not a replacement for it). It connects to the same Appium server
started by `npm run appium:start`. No extra setup is needed — any MCP client configured to read this
repo's `.mcp.json` will pick it up automatically.

## Prerequisites

- **Node.js** ≥ 18.20 (LTS 20/22 recommended) and npm
- **Java** (JDK 17) — required by the Android SDK tooling
- **Android Studio** or the standalone **Android SDK** (cmdline-tools, platform-tools, an emulator
  system image)
- **ADB** on your `PATH` (bundled with the Android SDK's `platform-tools`)
- A running **Android Emulator** (AVD) or a physical device with USB debugging enabled
- **Appium 2** — installed as a project devDependency, no global install required

## Installation

```bash
git clone <this-repo-url>
cd appium-typescript-framework
npm install

# Install the Appium UiAutomator2 driver (pinned for Appium 2 compatibility)
npm run appium:install-driver

# Download the ApiDemos APK into apps/ (or copy your own build to that path)
mkdir -p apps
curl -fL -o apps/ApiDemos-debug.apk \
  https://github.com/appium/appium/raw/1.x/sample-code/apps/ApiDemos-debug.apk

# Copy the env template and adjust for your machine (device name, platform version, ...)
cp .env.example .env
```

`.env` is git-ignored — it's where machine-specific values (emulator name, API level, Appium port)
belong. Nothing in the source tree hard-codes a local path; see `src/config/environment.ts`.

## Local Execution

1. **Start an emulator** (or plug in a device with `adb devices` showing it):
   ```bash
   emulator -avd <your_avd_name>
   ```
2. **Run the tests.** `npm run test:local` starts Appium for you automatically
   (via `@wdio/appium-service`) and tears it down after the run:
   ```bash
   npm run test:local
   ```
   If you'd rather manage the Appium server yourself (e.g. to watch its logs live), start it in one
   terminal and run against it in another:
   ```bash
   npm run appium:start        # terminal 1
   npm run test:android        # terminal 2
   ```
3. **Generate and view the Allure report:**
   ```bash
   npm run allure:report       # generate + open in one step
   # or individually:
   npm run allure:generate
   npm run allure:open
   ```

Other useful commands:

```bash
npm run typecheck     # tsc --noEmit — verified clean
npm run lint           # ESLint (flat config) — verified clean
npm run format         # Prettier --write
npm run format:check   # Prettier --check — verified clean
npm run clean           # wipe allure-results, allure-report, screenshots, logs, reports
```

All four (`typecheck`, `lint`, `format:check`, and an install of the UiAutomator2 driver + a live
Appium `/status` check) were run against this exact repository while building it and pass cleanly.
Full emulator-based execution is exercised in CI (see below) and is the recommended way to see the
suite run end-to-end if your local machine doesn't have an Android SDK/emulator set up.

## GitHub Actions

The workflow at `.github/workflows/mobile-tests.yml` runs on `push`, `pull_request`, and
`workflow_dispatch`, with two jobs:

1. **`static-checks`** — install, typecheck, lint, format-check. Fast, no emulator.
2. **`android-tests`** (needs `static-checks`) — boots a real Android emulator (via
   `reactivecircus/android-emulator-runner`, cached across runs), starts Appium 2 with the pinned
   UiAutomator2 driver, downloads the ApiDemos APK, runs the full suite, generates the Allure report,
   and uploads `allure-results`, `allure-report`, `screenshots`, and `test-logs` as artifacts — all
   under `if: always()`, so a failing suite still leaves you a downloadable report.

To run it manually: **Actions → Mobile Tests → Run workflow**. A failing test suite fails the job
(and the workflow run) by default — the artifact/report steps still execute because they carry
`if: always()`.

## Test Coverage

| #   | Spec                                                                 | Scenario                                               |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | `navigation.spec.ts`                                                 | App launches, home screen displayed                    |
| 2   | `navigation.spec.ts`                                                 | Home → Views navigation                                |
| 3   | `textFields.spec.ts`                                                 | Text entry + validation                                |
| 4   | `checkbox.spec.ts`                                                   | Checkbox selection + state validation                  |
| 5   | `checkbox.spec.ts`                                                   | Radio button selection + mutual-exclusivity validation |
| 6   | `datePicker.spec.ts`                                                 | Date picker dialog, date selection, validation         |
| 7   | `dialog.spec.ts`                                                     | Alert dialog message validation, accept/cancel         |
| 8   | `gesture.spec.ts`                                                    | Scroll reveals rows outside the initial viewport       |
| 9   | `gesture.spec.ts`                                                    | Reusable swipe gesture utility                         |
| 10  | _(all specs, via `afterTest` hook in `config/wdio.android.conf.ts`)_ | Automatic screenshot on any test failure               |

A long-press smoke test is included in `gesture.spec.ts` as well. `GestureUtils.dragAndDrop()` is
implemented and available for reuse, but is not exercised by the default suite — ApiDemos' Drag and
Drop screen doesn't expose stable resource-ids across builds, and this framework prefers stable
locators over brittle ones (see `src/utils/GestureUtils.ts`).

## Environment Configuration

All configuration flows through `src/config/environment.ts`, reading the variables below (see
`.env.example`); every one has a sensible local default.

| Variable                                             | Purpose                | Local default                                                        |
| ---------------------------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `TEST_ENV`                                           | `LOCAL` or `CI`        | `LOCAL`                                                              |
| `APPIUM_HOST` / `APPIUM_PORT` / `APPIUM_PATH`        | Appium server location | `127.0.0.1` / `4723` / `/`                                           |
| `PLATFORM_NAME` / `AUTOMATION_NAME`                  | Capability basics      | `Android` / `UiAutomator2`                                           |
| `DEVICE_NAME` / `PLATFORM_VERSION`                   | Target device          | `emulator-5554` / `13.0`                                             |
| `APP_PATH` / `APP_PACKAGE` / `APP_ACTIVITY`          | Application under test | `./apps/ApiDemos-debug.apk` / `io.appium.android.apis` / `.ApiDemos` |
| `AUTO_GRANT_PERMISSIONS` / `NO_RESET` / `FULL_RESET` | Session behavior       | `true` / `false` / `false`                                           |
| `NEW_COMMAND_TIMEOUT` / `DEFAULT_TIMEOUT_MS`         | Timeouts               | `120` / `15000`                                                      |

## Parallel Execution (Extending to Multiple Devices)

`src/config/capabilities.ts` already exports capabilities as an array (`androidCapabilities`), the
shape WebdriverIO expects for running multiple sessions in parallel. To extend this to several
emulators/devices:

```text
Device 1 (emulator-5554) → capabilities[0] → Worker 1 → full spec suite
Device 2 (emulator-5556) → capabilities[1] → Worker 2 → full spec suite
Device 3 (physical device) → capabilities[2] → Worker 3 → full spec suite
```

1. Push a second (third, ...) entry onto the array returned by `buildAndroidCapabilities()` — same
   shape, different `appium:deviceName`/`appium:udid`.
2. Raise `maxInstances` in `config/wdio.android.conf.ts` above `1`.
3. Boot the additional emulators/devices before the run (`emulator -avd <name> &` per device, or add
   another `reactivecircus/android-emulator-runner` matrix entry in CI).

This isn't wired up by default — a single, reliable emulator is a more honest starting point for a
framework meant to be read and understood in an interview — but no architectural change is needed to
turn it on.

## Troubleshooting

| Symptom                                                         | Likely cause / fix                                                                                                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adb devices` shows nothing                                     | Emulator hasn't finished booting, or `adb` isn't on `PATH`. Run `adb kill-server && adb start-server` and wait for `emulator: Boot completed`.                                    |
| WebdriverIO can't connect / `ECONNREFUSED`                      | Appium server isn't running, or `APPIUM_HOST`/`APPIUM_PORT` in `.env` don't match where it's listening. Use `npm run appium:start` in its own terminal to see logs directly.      |
| `A driver for automationName 'UiAutomator2' could not be found` | The driver isn't installed. Run `npm run appium:install-driver` (pinned to `4.2.9` — see Version Notes above; installing without a version pulls an Appium‑3‑only build).         |
| Emulator won't boot / hangs at splash                           | Cold-boot it once from Android Studio's AVD Manager first; ensure hardware acceleration (HAXM/KVM) is enabled; in CI this is handled by `reactivecircus/android-emulator-runner`. |
| `appium:app` file not found                                     | `APP_PATH` doesn't point at a real APK. Confirm `apps/ApiDemos-debug.apk` exists (see Installation) — the path is resolved relative to the project root, not your shell's cwd.    |
| Session created but every element lookup times out              | App may still be granting runtime permission dialogs. Confirm `AUTO_GRANT_PERMISSIONS=true`, or increase `DEFAULT_TIMEOUT_MS`.                                                    |
| `EACCES`/permission errors installing the APK                   | Re-run `adb uninstall io.appium.android.apis` first if a stale install conflicts, then retry with `appium:fullReset` enabled for one run.                                         |

## License

MIT — see `LICENSE`.
