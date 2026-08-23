import type { Capabilities, Options } from '@wdio/types';
import { config as androidConfig } from './wdio.android.conf.js';
import { env } from '../src/config/environment.js';

type TestrunnerConfig = Options.Testrunner & Capabilities.WithRequestedTestrunnerCapabilities;

/**
 * Local development configuration.
 *
 * Identical to `wdio.android.conf.ts` except it also launches (and tears
 * down) an Appium server for you via `@wdio/appium-service`, so
 * `npm run test:local` is a single command: no separate `appium` process to
 * remember to start first. Use `npm run test:android` (the base config)
 * when Appium is already running as its own step — e.g. in CI.
 */
export const config: TestrunnerConfig = {
  ...androidConfig,

  services: [
    [
      'appium',
      {
        port: env.appiumPort,
        command: 'appium',
        args: {
          relaxedSecurity: true,
        },
        logPath: './logs/',
      },
    ],
  ],

  logLevel: 'info',
};
