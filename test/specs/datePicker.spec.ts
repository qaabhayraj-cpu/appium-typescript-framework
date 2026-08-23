import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { ViewsPage } from '../../src/pages/ViewsPage.js';
import { DateWidgetsPage } from '../../src/pages/DateWidgetsPage.js';
import { Logger } from '../../src/utils/Logger.js';
import { FileUtils } from '../../src/utils/FileUtils.js';
import type { TestData } from '../../src/types/framework.types.js';

const testData = FileUtils.readJson<TestData>('test/data/testData.json');

describe('Date Picker', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();
  const dateWidgetsPage = new DateWidgetsPage();

  beforeEach(async () => {
    await homePage.restartApp();
    await homePage.waitForScreen();
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
    await viewsPage.openDateWidgets();
    await viewsPage.tapListItem('1. Dialog');
    await dateWidgetsPage.waitForScreen();
  });

  // Test 6 — Date Picker
  it('opens the date picker, selects a date, and validates the selection', async () => {
    Logger.info('Starting test: date picker selection');

    const dateBefore = await dateWidgetsPage.getDateDisplayText();
    Logger.info(`Date display before selection: "${dateBefore}"`);

    await dateWidgetsPage.openDatePickerDialog();
    await dateWidgetsPage.selectDate(testData.datePicker);
    await dateWidgetsPage.confirmDate();

    const dateAfter = await dateWidgetsPage.getDateDisplayText();
    Logger.info(`Date display after selection: "${dateAfter}"`);

    expect(dateAfter, 'date display should update after picking a new date').to.not.equal(
      dateBefore,
    );
    expect(dateAfter, 'date display should reflect the selected year').to.include(
      String(testData.datePicker.year),
    );
    Logger.info('Assertion passed: selected date reflected on screen');
  });
});
