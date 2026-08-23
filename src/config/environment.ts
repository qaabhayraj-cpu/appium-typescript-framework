import 'dotenv/config';
import path from 'node:path';
import type { EnvironmentConfig, TestEnvironment } from '../types/framework.types.js';

/**
 * Reads a boolean-ish environment variable, e.g. "true" / "false" / "1" / "0".
 */
function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(value.trim().toLowerCase());
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value !== undefined && !Number.isNaN(parsed) ? parsed : fallback;
}

function readTestEnvironment(value: string | undefined): TestEnvironment {
  const upper = (value ?? 'LOCAL').toUpperCase();
  return upper === 'CI' ? 'CI' : 'LOCAL';
}

/**
 * Resolves the application path to an absolute path so the framework never
 * depends on the current working directory a command happens to be run from.
 * No machine-specific paths are hard-coded — everything is derived from the
 * project root plus an environment-configurable relative path.
 */
function resolveAppPath(rawPath: string): string {
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

/**
 * Centralized, typed access to all environment-driven configuration.
 * Every value has a sensible local default so `npm run test:local` works
 * out of the box once an emulator + Appium server are running.
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    testEnv: readTestEnvironment(process.env.TEST_ENV),
    appiumHost: process.env.APPIUM_HOST ?? '127.0.0.1',
    appiumPort: readNumber(process.env.APPIUM_PORT, 4723),
    appiumPath: process.env.APPIUM_PATH ?? '/',

    platformName: process.env.PLATFORM_NAME ?? 'Android',
    automationName: process.env.AUTOMATION_NAME ?? 'UiAutomator2',
    deviceName: process.env.DEVICE_NAME ?? 'emulator-5554',
    platformVersion: process.env.PLATFORM_VERSION ?? '13.0',

    appPath: resolveAppPath(process.env.APP_PATH ?? './apps/ApiDemos-debug.apk'),
    appPackage: process.env.APP_PACKAGE ?? 'io.appium.android.apis',
    appActivity: process.env.APP_ACTIVITY ?? '.ApiDemos',

    autoGrantPermissions: readBoolean(process.env.AUTO_GRANT_PERMISSIONS, true),
    noReset: readBoolean(process.env.NO_RESET, false),
    fullReset: readBoolean(process.env.FULL_RESET, false),
    newCommandTimeout: readNumber(process.env.NEW_COMMAND_TIMEOUT, 120),

    defaultTimeoutMs: readNumber(process.env.DEFAULT_TIMEOUT_MS, 15_000),
  };
}

export const env = getEnvironmentConfig();
