import { BasePage } from './BasePage.js';
import { AppConstants } from '../constants/appConstants.js';
import { Logger } from '../utils/Logger.js';
import type { DatePickerTestData } from '../types/framework.types.js';

/**
 * Views → Date Widgets → "1. Dialog" — shows the currently selected date and
 * a button that opens the native `DatePickerDialog`. The dialog renders as
 * three spinner-style `NumberPicker` widgets (month / day / year); each
 * exposes an internal editable `EditText` (framework id
 * `android:id/numberpicker_input`) that can be set directly, which is far
 * more reliable than simulating repeated spinner swipes.
 */
export class DateWidgetsPage extends BasePage {
  private readonly pickDateButton = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/pickDate")`;
  private readonly dateDisplay = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/dateDisplay")`;

  // Standard AOSP AlertDialog button ids — stable across the OS, not the app.
  private readonly setButton = 'android=new UiSelector().resourceId("android:id/button1")';
  private readonly cancelButton = 'android=new UiSelector().resourceId("android:id/button2")';

  private numberPickerInput(instance: number): string {
    return (
      `android=new UiSelector().className("android.widget.NumberPicker").instance(${instance})` +
      `.childSelector(new UiSelector().className("android.widget.EditText"))`
    );
  }

  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(this.pickDateButton);
  }

  async isScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.pickDateButton);
  }

  async getDateDisplayText(): Promise<string> {
    return this.getText(this.dateDisplay);
  }

  async openDatePickerDialog(): Promise<void> {
    await this.click(this.pickDateButton);
    await this.waitForDisplayed(this.setButton);
  }

  /**
   * Sets month/day/year on the open DatePickerDialog's spinners and confirms
   * it. Spinner order (month, day, year) matches ApiDemos' default US locale
   * layout; adjust `numberPickerInput` instance indices if targeting a
   * different locale/build.
   */
  async selectDate(date: DatePickerTestData): Promise<void> {
    Logger.info(`Selecting date: ${date.month}/${date.day}/${date.year}`);
    const [monthInput, dayInput, yearInput] = [0, 1, 2].map((i) => this.numberPickerInput(i));

    await this.setValue(monthInput, String(date.month));
    await browser.hideKeyboard().catch(() => undefined);
    await this.setValue(dayInput, String(date.day));
    await browser.hideKeyboard().catch(() => undefined);
    await this.setValue(yearInput, String(date.year));
    await browser.hideKeyboard().catch(() => undefined);
  }

  async confirmDate(): Promise<void> {
    await this.click(this.setButton);
  }

  async cancelDate(): Promise<void> {
    await this.click(this.cancelButton);
  }
}
