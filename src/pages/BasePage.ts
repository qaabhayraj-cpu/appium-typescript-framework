import { AppConstants } from '../constants/appConstants.js';
import { GestureUtils } from '../utils/GestureUtils.js';
import { Logger } from '../utils/Logger.js';
import { ScreenshotUtils } from '../utils/ScreenshotUtils.js';
import { WaitUtils } from '../utils/WaitUtils.js';

/** A WebdriverIO element selector — accessibility id, resource-id, UiAutomator expression, xpath, ... */
export type Selector = string;

/**
 * Base class for every Page Object in the framework.
 *
 * It wraps the common WebdriverIO element operations (click, getText,
 * setValue, waits, ...) once, so individual page objects only describe *what*
 * elements exist on a screen and *how* to navigate/interact with them — never
 * how to click or wait for an element, which is handled centrally here.
 */
export abstract class BasePage {
  /** Resolves a selector string to a WebdriverIO element handle. */
  protected element(selector: Selector): WebdriverIO.Element {
    return browser.$(selector) as unknown as WebdriverIO.Element;
  }

  /** Resolves a selector string to a collection of WebdriverIO element handles. */
  protected elements(selector: Selector): WebdriverIO.ElementArray {
    return browser.$$(selector) as unknown as WebdriverIO.ElementArray;
  }

  /** Waits until the element is displayed. */
  async waitForDisplayed(
    selector: Selector,
    timeoutMs = AppConstants.TIMEOUTS.DEFAULT_MS,
  ): Promise<void> {
    const el = await this.element(selector);
    await WaitUtils.waitForDisplayed(el, timeoutMs, selector);
  }

  /** Waits until the element is displayed and enabled (i.e. safe to click). */
  async waitForClickable(
    selector: Selector,
    timeoutMs = AppConstants.TIMEOUTS.DEFAULT_MS,
  ): Promise<void> {
    const el = await this.element(selector);
    await WaitUtils.waitForClickable(el, timeoutMs, selector);
  }

  /** Clicks an element, waiting for it to become clickable first. */
  async click(selector: Selector): Promise<void> {
    await this.waitForClickable(selector);
    const el = await this.element(selector);
    Logger.info(`Clicking element: ${selector}`);
    await el.click();
  }

  /** Reads the visible text of an element, waiting for it to be displayed first. */
  async getText(selector: Selector): Promise<string> {
    await this.waitForDisplayed(selector);
    const el = await this.element(selector);
    return el.getText();
  }

  /** Clears and types a value into an input element. */
  async setValue(selector: Selector, value: string): Promise<void> {
    await this.waitForClickable(selector);
    const el = await this.element(selector);
    Logger.info(`Entering value into ${selector}: "${value}"`);
    await el.clearValue();
    await el.setValue(value);
  }

  /** Clears the value of an input element. */
  async clearValue(selector: Selector): Promise<void> {
    const el = await this.element(selector);
    await el.clearValue();
  }

  /** Returns whether the element is currently displayed, without throwing if it never appears. */
  async isDisplayed(selector: Selector): Promise<boolean> {
    const el = await this.element(selector);
    return el.isDisplayed().catch(() => false);
  }

  /**
   * Returns whether a checkbox/radio/switch-like element is currently
   * checked. Deliberately reads the Android `checked` accessibility
   * attribute rather than calling WebDriver's `isSelected()` — on Android,
   * "selected" and "checked" are two distinct AccessibilityNodeInfo flags,
   * and `isSelected()` reports the former, which stays false for
   * CheckBox/RadioButton widgets regardless of their checked state.
   */
  async isChecked(selector: Selector): Promise<boolean> {
    const el = await this.element(selector);
    const checked = await el.getAttribute('checked');
    return checked === 'true';
  }

  /** Scrolls an Android scrollable container until the element is in view, returning it. */
  async scrollToElement(uiSelector: string): Promise<WebdriverIO.Element> {
    return GestureUtils.scrollToElement(uiSelector);
  }

  /** Captures a named screenshot (for debugging or documentation, not just on failure). */
  async takeScreenshot(name: string): Promise<string> {
    return ScreenshotUtils.capture(name);
  }

  /** Waits for a generic condition — thin pass-through to WaitUtils for pages that need it. */
  async waitUntil(condition: () => Promise<boolean> | boolean, message?: string): Promise<void> {
    await WaitUtils.waitUntil(condition, { message });
  }

  /**
   * Builds a `-android uiautomator` selector matching a list row by its
   * exact visible text. ApiDemos' navigation is one long chain of standard
   * Android `ListView`s (Home → Views → Controls → ...), so every page that
   * needs to tap a row shares this single helper instead of redefining it.
   */
  protected listItemSelector(label: string): Selector {
    return `android=new UiSelector().text("${label}")`;
  }

  /** Taps a list row by its exact visible text (see `listItemSelector`). */
  async tapListItem(label: string): Promise<void> {
    Logger.info(`Tapping list item: "${label}"`);
    await this.click(this.listItemSelector(label));
  }

  /**
   * Terminates and relaunches the app under test, landing back on the Home
   * screen. WDIO runs every `it` in a spec file inside one shared app
   * session, so without an explicit reset a test starts wherever the
   * previous one left off. Call this as the first line of a spec's
   * `beforeEach` (not in a wdio-level `beforeTest` hook — see the comment in
   * `config/wdio.android.conf.ts` for why that ordering matters).
   */
  async restartApp(): Promise<void> {
    Logger.info('Restarting app for test isolation');
    await browser.terminateApp(AppConstants.APP_PACKAGE);
    await browser.activateApp(AppConstants.APP_PACKAGE);
  }
}
