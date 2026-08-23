import { BasePage } from './BasePage.js';
import { AppConstants } from '../constants/appConstants.js';
import { Logger } from '../utils/Logger.js';
import type { DatePickerTestData } from '../types/framework.types.js';

/**
 * Views → Date Widgets → "1. Dialog" — shows the currently selected date and
 * a button that opens the native Material `DatePickerDialog` (a year list
 * plus a month-grid calendar, confirmed via `uiautomator dump` against the
 * real ApiDemos build — not the legacy spinner-style picker).
 *
 * Selection strategy: jump straight to the target year via the year list,
 * page the month grid with the prev/next controls by the exact delta from
 * whichever month is currently showing, then tap the target day cell.
 */
export class DateWidgetsPage extends BasePage {
  private readonly pickDateButton = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/pickDate")`;
  private readonly dateDisplay = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/dateDisplay")`;

  // Standard AOSP dialog ids — stable across the OS, not the app.
  private readonly setButton = 'android=new UiSelector().resourceId("android:id/button1")';
  private readonly cancelButton = 'android=new UiSelector().resourceId("android:id/button2")';
  private readonly yearHeader =
    'android=new UiSelector().resourceId("android:id/date_picker_header_year")';
  private readonly nextMonthButton = 'android=new UiSelector().resourceId("android:id/next")';
  private readonly prevMonthButton = 'android=new UiSelector().resourceId("android:id/prev")';
  private readonly headerDate =
    'android=new UiSelector().resourceId("android:id/date_picker_header_date")';

  private static readonly MONTH_ABBREVIATIONS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const;

  private yearListItem(year: number): string {
    return `android=new UiSelector().resourceId("android:id/text1").text("${year}")`;
  }

  private dayCell(day: number): string {
    return `android=new UiSelector().className("android.view.View").text("${day}")`;
  }

  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(this.pickDateButton);
  }

  async isScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.pickDateButton);
  }

  /** Reads the on-screen date summary, formatted by the app as `M-D-YYYY HH:MM`. */
  async getDateDisplayText(): Promise<string> {
    return this.getText(this.dateDisplay);
  }

  async openDatePickerDialog(): Promise<void> {
    await this.click(this.pickDateButton);
    await this.waitForDisplayed(this.yearHeader);
  }

  /**
   * Selects month/day/year on the open DatePickerDialog and leaves it open
   * (call `confirmDate()`/`cancelDate()` after). The month grid only exposes
   * relative paging (prev/next), so the starting month is read from the
   * dialog's own header — *not* the underlying screen's `dateDisplay`, which
   * is covered (and so `isDisplayed()`/`getText()`-unreachable) while the
   * dialog is open.
   */
  async selectDate(date: DatePickerTestData): Promise<void> {
    const headerText = await this.getText(this.headerDate); // e.g. "Sun, Aug 23"
    const monthAbbreviation = headerText.split(', ')[1]?.split(' ')[0];
    const currentMonthIndex = DateWidgetsPage.MONTH_ABBREVIATIONS.indexOf(
      (monthAbbreviation ?? '') as (typeof DateWidgetsPage.MONTH_ABBREVIATIONS)[number],
    );
    if (currentMonthIndex === -1) {
      throw new Error(`Could not parse month from date picker header text: "${headerText}"`);
    }
    const currentMonth = currentMonthIndex + 1; // MONTH_ABBREVIATIONS is 0-indexed; test data is 1-indexed.
    Logger.info(
      `Selecting date: ${date.month}/${date.day}/${date.year} (calendar currently on month ${currentMonth})`,
    );

    // Jump straight to the target year.
    await this.click(this.yearHeader);
    const yearOption = await this.scrollToElement(this.yearListItem(date.year));
    await yearOption.click();

    // Page the month grid to the target month (year selection alone doesn't
    // move the month). No modulo/year-wrap handling needed: the year is
    // already fixed above, so this is a plain, possibly negative, delta.
    const monthDelta = date.month - currentMonth;
    const monthButtonSelector = monthDelta >= 0 ? this.nextMonthButton : this.prevMonthButton;
    for (let i = 0; i < Math.abs(monthDelta); i += 1) {
      await this.click(monthButtonSelector);
    }

    await this.click(this.dayCell(date.day));
  }

  async confirmDate(): Promise<void> {
    await this.click(this.setButton);
  }

  async cancelDate(): Promise<void> {
    await this.click(this.cancelButton);
  }
}
