import { AppConstants } from '../constants/appConstants.js';
import { Logger } from './Logger.js';
import type { SwipeDirection, SwipeOptions } from '../types/framework.types.js';

/**
 * Reusable Android gesture helpers built entirely on Appium 2's UiAutomator2
 * `mobile:` gesture extensions (`mobile: swipeGesture`, `mobile:
 * longClickGesture`, `mobile: dragGesture`, `mobile: clickGesture`, `mobile:
 * scrollGesture`). These replace the deprecated W3C-predating `TouchAction` /
 * `MultiAction` APIs, which were removed from modern WebdriverIO and are no
 * longer recommended by Appium.
 *
 * Reference: https://github.com/appium/appium-uiautomator2-driver#mobile-gesture-commands
 */
export const GestureUtils = {
  /** Returns the current viewport size, used to compute gesture coordinates. */
  async getWindowSize(): Promise<{ width: number; height: number }> {
    return browser.getWindowSize();
  },

  /**
   * Performs a swipe across the whole screen in the given direction.
   * `percentage` (0-1) controls how much of the screen height/width the
   * swipe covers; `duration` is in milliseconds.
   */
  async swipe(direction: SwipeDirection, options: SwipeOptions = {}): Promise<void> {
    const { percentage = 0.75, duration = 400 } = options;
    const { width, height } = await this.getWindowSize();

    const left = Math.round(width * 0.1);
    const top = Math.round(height * 0.15);
    const gestureWidth = Math.round(width * 0.8);
    const gestureHeight = Math.round(height * 0.7);

    Logger.info(`Swiping ${direction} (percentage=${percentage}, duration=${duration}ms)`);

    await browser.execute('mobile: swipeGesture', {
      left,
      top,
      width: gestureWidth,
      height: gestureHeight,
      direction,
      percent: percentage,
      speed: Math.round((gestureHeight * 1000) / Math.max(duration, 1)),
    });
  },

  async swipeUp(options?: SwipeOptions): Promise<void> {
    await this.swipe('up', options);
  },

  async swipeDown(options?: SwipeOptions): Promise<void> {
    await this.swipe('down', options);
  },

  async swipeLeft(options?: SwipeOptions): Promise<void> {
    await this.swipe('left', options);
  },

  async swipeRight(options?: SwipeOptions): Promise<void> {
    await this.swipe('right', options);
  },

  /** Long-presses the given element for `durationMs` (default 1s). */
  async longPress(element: WebdriverIO.Element, durationMs = 1000): Promise<void> {
    const elementId = await element.elementId;
    Logger.info(`Long-pressing element for ${durationMs}ms`);
    await browser.execute('mobile: longClickGesture', {
      elementId,
      duration: durationMs,
    });
  },

  /** Taps the given element via the native gesture command (as opposed to a plain WebDriver click). */
  async tap(element: WebdriverIO.Element): Promise<void> {
    const elementId = await element.elementId;
    await browser.execute('mobile: clickGesture', { elementId });
  },

  /** Drags `source` and drops it onto `target`. */
  async dragAndDrop(
    source: WebdriverIO.Element,
    target: WebdriverIO.Element,
    speed = 2500,
  ): Promise<void> {
    const sourceId = await source.elementId;
    const targetId = await target.elementId;
    Logger.info('Performing drag and drop gesture');
    await browser.execute('mobile: dragGesture', {
      elementId: sourceId,
      destElementId: targetId,
      speed,
    });
  },

  /**
   * Scrolls an Android scrollable container until the element matched by
   * `uiSelector` (an `-android uiautomator` UiSelector expression) becomes
   * visible, then returns it. Uses UiAutomator2's native `UiScrollable`
   * support, which is far more reliable on long lists than repeated manual
   * swipes.
   */
  async scrollToElement(
    uiSelector: string,
    maxSwipes = AppConstants.TIMEOUTS.SHORT_MS / 500,
  ): Promise<WebdriverIO.Element> {
    const scrollableSelector =
      `android=new UiScrollable(new UiSelector().scrollable(true)).setMaxSearchSwipes(${maxSwipes})` +
      `.scrollIntoView(${uiSelector})`;

    Logger.info(`Scrolling to element via UiScrollable: ${uiSelector}`);
    const chainableElement = browser.$(scrollableSelector);
    await chainableElement.waitForDisplayed({ timeout: AppConstants.TIMEOUTS.DEFAULT_MS });
    return chainableElement.getElement();
  },
};
