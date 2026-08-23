/**
 * Static, environment-independent constants describing the Android ApiDemos
 * application under test. Keep locators that are truly stable across the app
 * here; screen-specific selectors live in their respective Page Objects.
 */
export const AppConstants = {
  APP_PACKAGE: 'io.appium.android.apis',
  APP_ACTIVITY: '.ApiDemos',

  TIMEOUTS: {
    DEFAULT_MS: 15_000,
    SHORT_MS: 5_000,
    LONG_MS: 30_000,
    POLL_INTERVAL_MS: 250,
  },

  DIRECTORIES: {
    SCREENSHOTS: 'screenshots',
    LOGS: 'logs',
    ALLURE_RESULTS: 'allure-results',
    REPORTS: 'reports',
  },

  HOME_MENU_ITEMS: {
    VIEWS: 'Views',
    APP: 'App',
  },
} as const;
