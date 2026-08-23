import { env } from './environment.js';

/**
 * Builds the Android/UiAutomator2 capability set from the resolved
 * environment configuration. Nothing here is machine-specific — every value
 * flows from environment variables (see `.env.example`), so the same code
 * runs unchanged on a developer laptop or in GitHub Actions.
 */
export function buildAndroidCapabilities(): WebdriverIO.Capabilities {
  return {
    platformName: env.platformName,
    'appium:automationName': env.automationName,
    'appium:deviceName': env.deviceName,
    'appium:platformVersion': env.platformVersion,
    'appium:app': env.appPath,
    'appium:appPackage': env.appPackage,
    'appium:appActivity': env.appActivity,
    'appium:autoGrantPermissions': env.autoGrantPermissions,
    'appium:noReset': env.noReset,
    'appium:fullReset': env.fullReset,
    'appium:newCommandTimeout': env.newCommandTimeout,
    // Speeds up UiAutomator2 element lookups; we drive our own explicit waits.
    'appium:disableWindowAnimation': true,
    'appium:autoAcceptAlerts': false,
  } satisfies WebdriverIO.Capabilities;
}

/**
 * Exported as an array to match WebdriverIO's `capabilities` config shape,
 * which supports multiple parallel sessions (see README §Parallel Execution
 * for how to extend this to several emulators/devices).
 */
export const androidCapabilities: WebdriverIO.Capabilities[] = [buildAndroidCapabilities()];
