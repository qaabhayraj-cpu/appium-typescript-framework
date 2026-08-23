import { AppConstants } from '../constants/appConstants.js';
import { Logger } from './Logger.js';

/**
 * Centralized wait strategy for the framework.
 *
 * Every method here wraps WebdriverIO's built-in polling waits
 * (`waitForDisplayed`, `waitForEnabled`, `waitUntil`, ...). No method in this
 * class — or anywhere else in the framework — should reach for
 * `browser.pause()`; hard sleeps are flaky and slow the suite down for no
 * benefit over condition-based polling.
 */
export const WaitUtils = {
  /** Waits until the element is displayed, throwing a descriptive error otherwise. */
  async waitForDisplayed(
    element: WebdriverIO.Element,
    timeoutMs: number = AppConstants.TIMEOUTS.DEFAULT_MS,
    description = 'element',
  ): Promise<void> {
    await element.waitForDisplayed({
      timeout: timeoutMs,
      timeoutMsg: `Timed out after ${timeoutMs}ms waiting for ${description} to be displayed`,
    });
  },

  /** Waits until the element is displayed AND enabled/clickable. */
  async waitForClickable(
    element: WebdriverIO.Element,
    timeoutMs: number = AppConstants.TIMEOUTS.DEFAULT_MS,
    description = 'element',
  ): Promise<void> {
    await element.waitForDisplayed({ timeout: timeoutMs });
    await element.waitForEnabled({
      timeout: timeoutMs,
      timeoutMsg: `Timed out after ${timeoutMs}ms waiting for ${description} to become clickable`,
    });
  },

  /** Waits until the element is removed from the DOM/UI tree, or hidden. */
  async waitForNotDisplayed(
    element: WebdriverIO.Element,
    timeoutMs: number = AppConstants.TIMEOUTS.DEFAULT_MS,
  ): Promise<void> {
    await element.waitForDisplayed({ timeout: timeoutMs, reverse: true });
  },

  /**
   * Generic condition poller for cases not covered by the helpers above
   * (e.g. waiting for a dialog's text to match, or an animation to settle).
   */
  async waitUntil(
    condition: () => Promise<boolean> | boolean,
    options: { timeoutMs?: number; interval?: number; message?: string } = {},
  ): Promise<void> {
    const {
      timeoutMs = AppConstants.TIMEOUTS.DEFAULT_MS,
      interval = AppConstants.TIMEOUTS.POLL_INTERVAL_MS,
      message = 'Condition was not met in time',
    } = options;

    await browser.waitUntil(condition, { timeout: timeoutMs, interval, timeoutMsg: message });
  },

  /**
   * Escape hatch for the rare case a fixed delay is genuinely required
   * (e.g. letting a system dialog animation finish where no reliable
   * condition exists). Logs a warning so overuse is visible in test output.
   */
  async pauseIfAbsolutelyNecessary(ms: number, reason: string): Promise<void> {
    Logger.warn(`Hard pause of ${ms}ms used — ${reason}`);
    await browser.pause(ms);
  },
};
