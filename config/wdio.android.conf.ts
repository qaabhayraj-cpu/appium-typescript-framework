import type { Capabilities, Options } from '@wdio/types';
import { env } from '../src/config/environment.js';
import { androidCapabilities } from '../src/config/capabilities.js';
import { AppConstants } from '../src/constants/appConstants.js';
import { ScreenshotUtils } from '../src/utils/ScreenshotUtils.js';
import { Logger } from '../src/utils/Logger.js';

type TestrunnerConfig = Options.Testrunner & Capabilities.WithRequestedTestrunnerCapabilities;

/**
 * Base Android/UiAutomator2 configuration.
 *
 * This file assumes an Appium server is already reachable at
 * `APPIUM_HOST:APPIUM_PORT` (started as its own step — this is how the
 * GitHub Actions workflow runs, and how `npm run test:android` is meant to
 * be invoked locally too). For a single-command local workflow that also
 * launches Appium for you, use `wdio.local.conf.ts` instead
 * (`npm run test:local`), which extends this file.
 */
export const config: TestrunnerConfig = {
  runner: 'local',

  // --- Appium connection -----------------------------------------------------
  hostname: env.appiumHost,
  port: env.appiumPort,
  path: env.appiumPath,

  specs: ['../test/specs/**/*.spec.ts'],
  exclude: [],

  maxInstances: 1,
  capabilities: androidCapabilities,

  logLevel: env.testEnv === 'CI' ? 'info' : 'warn',
  bail: 0,
  waitforTimeout: AppConstants.TIMEOUTS.DEFAULT_MS,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: AppConstants.DIRECTORIES.ALLURE_RESULTS,
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
      },
    ],
  ],

  // --- Lifecycle hooks --------------------------------------------------------
  onPrepare(): void {
    Logger.info(`Test run starting — environment: ${env.testEnv}`);
    Logger.info(`Target app: ${env.appPath}`);
  },

  before(): void {
    Logger.info('Session started');
  },

  beforeTest(test): void {
    Logger.info(`Starting test: ${test.parent} > ${test.title}`);
  },

  /**
   * Automatic failure-screenshot capture (Test 10 / framework requirement
   * §11). Runs after every test; only captures when the test actually
   * failed, and never lets a screenshot failure mask the original test
   * error.
   */
  afterTest: async (test, _context, result): Promise<void> => {
    if (!result.passed) {
      const testTitle = `${test.parent}_${test.title}`;
      try {
        await ScreenshotUtils.captureOnFailure(testTitle);
      } catch (screenshotError) {
        Logger.error('Failed to capture failure screenshot', screenshotError);
      }
      Logger.error(`Test failed: ${test.parent} > ${test.title}`, result.error);
    } else {
      Logger.info(`Test completed: ${test.parent} > ${test.title}`);
    }
  },

  onComplete(): void {
    Logger.info('Test run complete');
  },
};
