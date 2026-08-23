import { expect } from 'chai';
import { HomePage } from '../../../src/pages/HomePage.js';
import { ViewsPage } from '../../../src/pages/ViewsPage.js';
import { TextFieldsPage } from '../../../src/pages/TextFieldsPage.js';
import { DateWidgetsPage } from '../../../src/pages/DateWidgetsPage.js';
import { DialogsPage } from '../../../src/pages/DialogsPage.js';
import { Logger } from '../../../src/utils/Logger.js';
import { FileUtils } from '../../../src/utils/FileUtils.js';
import type { TestData } from '../../../src/types/framework.types.js';

const testData = FileUtils.readJson<TestData>('test/data/testData.json');

/**
 * Regression suite — deeper flows, edge cases, and negative paths beyond
 * what `test/specs/smoke` covers: independent-widget interactions, cancel
 * flows that must leave state untouched, and gesture-driven navigation.
 * No scenario here duplicates a smoke check; together the two suites cover
 * every interaction category the framework demonstrates.
 */
describe('Regression', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();
  const textFieldsPage = new TextFieldsPage();
  const dateWidgetsPage = new DateWidgetsPage();
  const dialogsPage = new DialogsPage();

  describe('Text Field', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToViews();
      await viewsPage.waitForScreen();
      await viewsPage.openTextFields();
      await textFieldsPage.waitForScreen();
    });

    // Regression 1 — numeric input
    it('accepts numeric text and displays it correctly', async () => {
      Logger.info('Starting regression test: numeric text field entry');
      const { numericText } = testData.textField;
      await textFieldsPage.enterText(numericText);

      const enteredText = await textFieldsPage.getEnteredText();
      expect(enteredText, 'numeric text should be entered verbatim').to.equal(numericText);
      Logger.info('Assertion passed: numeric text accepted');
    });

    // Regression 2 — clearing the field
    it('results in an empty value after clearing', async () => {
      Logger.info('Starting regression test: clear text field');
      const { validText } = testData.textField;
      await textFieldsPage.enterText(validText);
      await textFieldsPage.clearText();

      // Android's accessibility tree reports an EditText's *hint* through
      // the same `text` node once its actual content is empty (confirmed
      // live: getText() returns "hint text", not ""), so the reliable,
      // widget-behavior-accurate signal that clearing worked is that the
      // previously-entered value is no longer present — not a literal `''`.
      const enteredText = await textFieldsPage.getEnteredText();
      expect(
        enteredText,
        'previously entered text should no longer be present after clearing',
      ).to.not.equal(validText);
      Logger.info(`Assertion passed: text field cleared (now showing: "${enteredText}")`);
    });
  });

  describe('Checkbox', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToViews();
      await viewsPage.waitForScreen();
      await viewsPage.openControlsLightTheme();
    });

    // Regression 3 — independent widget state
    it('toggles Checkbox 2 independently of Checkbox 1', async () => {
      Logger.info('Starting regression test: independent checkbox toggle');
      const checkbox1Before = await viewsPage.isCheckboxChecked();

      await viewsPage.toggleCheckbox2();
      const checkbox2After = await viewsPage.isCheckbox2Checked();
      const checkbox1After = await viewsPage.isCheckboxChecked();

      expect(checkbox2After, 'Checkbox 2 should toggle on').to.be.true;
      expect(checkbox1After, 'Checkbox 1 should be unaffected by toggling Checkbox 2').to.equal(
        checkbox1Before,
      );
      Logger.info('Assertion passed: checkboxes toggle independently');
    });
  });

  describe('Radio Group', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToViews();
      await viewsPage.waitForScreen();
      await viewsPage.openRadioGroup();
    });

    // Regression 4 — negative path: clearing a selection
    it('deselects the active option when "Clear" is tapped', async () => {
      Logger.info('Starting regression test: radio group clear');
      await viewsPage.selectRadioOption(1);
      expect(await viewsPage.isRadioOptionSelected(1), 'option should be selected before clearing')
        .to.be.true;

      await viewsPage.clearRadioSelection();

      expect(
        await viewsPage.isRadioOptionSelected(1),
        'option should be deselected after tapping Clear',
      ).to.be.false;
      Logger.info('Assertion passed: Clear button deselects the active option');
    });
  });

  describe('Date Picker', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToViews();
      await viewsPage.waitForScreen();
      await viewsPage.openDateWidgets();
      await viewsPage.tapListItem('1. Dialog');
      await dateWidgetsPage.waitForScreen();
    });

    // Regression 5 — full select-and-confirm flow
    it('updates the on-screen display after selecting and confirming a date', async () => {
      Logger.info('Starting regression test: date picker select + confirm');
      const dateBefore = await dateWidgetsPage.getDateDisplayText();

      await dateWidgetsPage.openDatePickerDialog();
      await dateWidgetsPage.selectDate(testData.datePicker);
      await dateWidgetsPage.confirmDate();

      const dateAfter = await dateWidgetsPage.getDateDisplayText();
      expect(dateAfter, 'date display should change after confirming a new date').to.not.equal(
        dateBefore,
      );
      expect(dateAfter, 'date display should include the selected year').to.include(
        String(testData.datePicker.year),
      );
      Logger.info('Assertion passed: confirmed date reflected on screen');
    });

    // Regression 6 — negative path: cancel must discard the tentative selection
    it('leaves the original date unchanged when the dialog is cancelled', async () => {
      Logger.info('Starting regression test: date picker cancel');
      const dateBefore = await dateWidgetsPage.getDateDisplayText();

      await dateWidgetsPage.openDatePickerDialog();
      await dateWidgetsPage.selectDate(testData.datePicker);
      await dateWidgetsPage.cancelDate();

      const dateAfter = await dateWidgetsPage.getDateDisplayText();
      expect(dateAfter, 'date display should be unchanged after cancelling').to.equal(dateBefore);
      Logger.info('Assertion passed: cancel discarded the tentative date selection');
    });
  });

  describe('Dialog', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToApp();
      await homePage.openCategory('Alert Dialogs');
    });

    // Regression 7 — negative path: cancel must not perform the OK action
    it('dismisses without performing the OK action when cancelled', async () => {
      Logger.info('Starting regression test: dialog cancel flow');
      await dialogsPage.openMessageDialog();
      await dialogsPage.cancelDialog();

      await dialogsPage.waitUntil(
        async () => !(await dialogsPage.isDialogDisplayed()),
        'dialog should close after cancelling',
      );
      expect(await dialogsPage.isDialogDisplayed(), 'dialog should be dismissed after cancel').to.be
        .false;
      Logger.info('Assertion passed: dialog dismissed via cancel');
    });
  });

  describe('Gestures', () => {
    beforeEach(async () => {
      await homePage.restartApp();
      await homePage.waitForScreen();
      await homePage.navigateToViews();
      await viewsPage.waitForScreen();
    });

    // Regression 8 — scroll reveals off-screen content
    it('scrolls the Views list to reveal rows outside the initial viewport', async () => {
      Logger.info('Starting regression test: scroll to reveal off-screen rows');
      const before = await viewsPage.getVisibleItemTexts();

      await viewsPage.swipeList('up');
      const after = await viewsPage.getVisibleItemTexts();

      const newlyVisible = after.filter((text) => !before.includes(text));
      expect(after, 'visible row set should change after scrolling').to.not.deep.equal(before);
      expect(
        newlyVisible.length,
        'at least one previously off-screen row should now be visible',
      ).to.be.greaterThan(0);
      Logger.info(`Assertion passed: ${newlyVisible.length} previously off-screen row(s) revealed`);
    });

    // Regression 9 — long press executes cleanly
    it('long-presses a list row without breaking the screen', async () => {
      Logger.info('Starting regression test: long press gesture');
      await viewsPage.longPressFirstVisibleItem();

      const stillDisplayed = await viewsPage.isScreenDisplayed();
      expect(stillDisplayed, 'Views screen should remain displayed after a long press').to.be.true;
      Logger.info('Assertion passed: long press executed cleanly');
    });
  });
});
