/**
 * Shared type definitions for the automation framework.
 */

/** Supported execution environments. */
export type TestEnvironment = 'LOCAL' | 'CI';

/** Supported swipe / gesture directions. */
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

/** Resolved runtime configuration derived from environment variables. */
export interface EnvironmentConfig {
  testEnv: TestEnvironment;
  appiumHost: string;
  appiumPort: number;
  appiumPath: string;
  platformName: string;
  automationName: string;
  deviceName: string;
  platformVersion: string;
  appPath: string;
  appPackage: string;
  appActivity: string;
  autoGrantPermissions: boolean;
  noReset: boolean;
  fullReset: boolean;
  newCommandTimeout: number;
  defaultTimeoutMs: number;
}

/** Shape of a single (x, y) point used by gesture utilities. */
export interface Point {
  x: number;
  y: number;
}

/** Options accepted by GestureUtils.swipe helpers. */
export interface SwipeOptions {
  percentage?: number;
  duration?: number;
}

/** Shape of test data loaded from test/data/testData.json. */
export interface TextFieldTestData {
  validText: string;
  numericText: string;
}

export interface DatePickerTestData {
  day: number;
  month: number;
  year: number;
}

export interface TestData {
  textField: TextFieldTestData;
  datePicker: DatePickerTestData;
  dialog: {
    expectedTitleKeyword: string;
  };
}
