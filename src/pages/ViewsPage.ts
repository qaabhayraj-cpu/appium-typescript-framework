import { BasePage } from './BasePage.js';
import { GestureUtils } from '../utils/GestureUtils.js';
import { Logger } from '../utils/Logger.js';
import { AppConstants } from '../constants/appConstants.js';

/**
 * The "Views" submenu and the standard-control demo screens reached from it
 * (Controls → "1. Light Theme" for buttons/checkboxes, and "Radio Group" for
 * radio buttons). ApiDemos models each of these as its own trivial
 * `ListView`/`Activity`, but they are simple enough — a handful of widgets
 * apiece — that giving each its own Page Object would add indirection
 * without real benefit, so `ViewsPage` owns navigation through the whole
 * "Views" family plus the Controls/Radio Group widget interactions.
 */
export class ViewsPage extends BasePage {
  private readonly list = 'android=new UiSelector().resourceId("android:id/list")';

  private readonly button = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/button")`;
  private readonly checkbox = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/check1")`;

  private radioButton(instance: number): string {
    return `android=new UiSelector().className("android.widget.RadioButton").instance(${instance})`;
  }

  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(this.list);
    Logger.info('Views submenu is displayed');
  }

  async isScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.list);
  }

  // --- Navigation -----------------------------------------------------------

  async openControls(): Promise<void> {
    await this.tapListItem('Controls');
  }

  async openDateWidgets(): Promise<void> {
    await this.tapListItem('Date Widgets');
  }

  async openRadioGroup(): Promise<void> {
    await this.tapListItem('Radio Group');
  }

  async openDragAndDrop(): Promise<void> {
    await this.tapListItem('Drag and Drop');
  }

  /** Navigates Views → Controls → "1. Light Theme", the screen with the demo Button/CheckBox. */
  async openControlsLightTheme(): Promise<void> {
    await this.openControls();
    await this.tapListItem('1. Light Theme');
  }

  /** Navigates Views → Controls → "9. TextFields". */
  async openControlsTextFields(): Promise<void> {
    await this.openControls();
    await this.tapListItem('9. TextFields');
  }

  // --- "1. Light Theme" widget interactions ---------------------------------

  async clickButton(): Promise<void> {
    await this.click(this.button);
  }

  async getButtonText(): Promise<string> {
    return this.getText(this.button);
  }

  async toggleCheckbox(): Promise<void> {
    await this.click(this.checkbox);
  }

  async isCheckboxChecked(): Promise<boolean> {
    return this.isSelected(this.checkbox);
  }

  // --- "Radio Group" widget interactions -------------------------------------

  async selectRadioOption(instance: number): Promise<void> {
    await this.click(this.radioButton(instance));
  }

  async isRadioOptionSelected(instance: number): Promise<boolean> {
    return this.isSelected(this.radioButton(instance));
  }

  // --- Scroll / swipe playground ---------------------------------------------

  /**
   * Scrolls the Views list down until `label` is visible, using the
   * UiAutomator2 native `UiScrollable` gesture rather than blind swipes —
   * demonstrates `scrollToElement()` and lets tests reach entries that sit
   * below the initial viewport (e.g. "WebView").
   */
  async scrollToItem(label: string): Promise<WebdriverIO.Element> {
    Logger.info(`Scrolling Views list to item: "${label}"`);
    return this.scrollToElement(this.listItemSelector(label));
  }

  /** Swipes the list up/down; used to demonstrate the reusable swipe gesture directly. */
  async swipeList(direction: 'up' | 'down'): Promise<void> {
    if (direction === 'up') {
      await GestureUtils.swipeUp();
    } else {
      await GestureUtils.swipeDown();
    }
  }

  /**
   * Returns the visible-on-screen text of every currently rendered row.
   * Used by scroll/swipe tests to assert the viewport actually changed,
   * without depending on any single row's exact wording (which varies
   * across ApiDemos APK builds).
   */
  async getVisibleItemTexts(): Promise<string[]> {
    const rows = await this.elements(`${this.list}/android.widget.TextView`);
    // WebdriverIO's ElementArray.map is itself async-aware and returns
    // Promise<string[]> directly — no separate Promise.all needed.
    const texts = await rows.map((row) => row.getText());
    return texts.filter((text): text is string => Boolean(text));
  }

  /** Long-presses the first currently visible row — a smoke check that the gesture executes cleanly. */
  async longPressFirstVisibleItem(): Promise<void> {
    const rows = await this.elements(`${this.list}/android.widget.TextView`);
    const first = rows[0];
    if (!first) {
      throw new Error('No visible Views list item to long-press');
    }
    await GestureUtils.longPress(first);
  }
}
