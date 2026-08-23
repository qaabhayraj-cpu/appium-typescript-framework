import { expect } from 'chai';
import { HomePage } from '../../../src/pages/HomePage.js';
import { ViewsPage } from '../../../src/pages/ViewsPage.js';
import { TextFieldsPage } from '../../../src/pages/TextFieldsPage.js';
import { DialogsPage } from '../../../src/pages/DialogsPage.js';
import { Logger } from '../../../src/utils/Logger.js';
import { FileUtils } from '../../../src/utils/FileUtils.js';
import type { TestData } from '../../../src/types/framework.types.js';

const testData = FileUtils.readJson<TestData>('test/data/testData.json');

/**
 * Smoke suite — the minimum set of checks that answer "is the build
 * fundamentally broken?". One fast, critical-path assertion per major
 * feature area; no edge cases or negative paths (those live under
 * `test/specs/regression`). Intended to run on every push/PR as a quick
 * quality gate before the full regression suite runs.
 */
describe('Smoke', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();
  const textFieldsPage = new TextFieldsPage();
  const dialogsPage = new DialogsPage();

  beforeEach(async () => {
    await homePage.restartApp();
    await homePage.waitForScreen();
  });

  // Smoke 1 — Application launch
  it('launches the ApiDemos app and displays the home screen', async () => {
    Logger.info('Starting smoke test: application launch');
    const isDisplayed = await homePage.isHomeScreenDisplayed();
    expect(isDisplayed, 'home screen should be displayed after launch').to.be.true;
    Logger.info('Assertion passed: home screen displayed');
  });

  // Smoke 2 — Core navigation
  it('navigates from Home to the Views screen', async () => {
    Logger.info('Starting smoke test: navigate to Views');
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();

    const isDisplayed = await viewsPage.isScreenDisplayed();
    expect(isDisplayed, 'Views screen should be displayed after navigation').to.be.true;
    Logger.info('Assertion passed: Views screen displayed');
  });

  // Smoke 3 — Checkbox
  it('selects a checkbox and validates its checked state', async () => {
    Logger.info('Starting smoke test: checkbox selection');
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
    await viewsPage.openControlsLightTheme();

    const initiallyChecked = await viewsPage.isCheckboxChecked();
    await viewsPage.toggleCheckbox();
    const isChecked = await viewsPage.isCheckboxChecked();

    expect(isChecked, 'checkbox should toggle to the opposite state').to.equal(!initiallyChecked);
    Logger.info('Assertion passed: checkbox state toggled as expected');
  });

  // Smoke 4 — Radio button
  it('selects a radio button option and validates its selected state', async () => {
    Logger.info('Starting smoke test: radio button selection');
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
    await viewsPage.openRadioGroup();

    await viewsPage.selectRadioOption(0);
    const isSelected = await viewsPage.isRadioOptionSelected(0);

    expect(isSelected, 'radio option should be selected after tapping it').to.be.true;
    Logger.info('Assertion passed: radio option selected');
  });

  // Smoke 5 — Text field
  it('enters text into the text field and validates it', async () => {
    Logger.info('Starting smoke test: text field entry');
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
    await viewsPage.openTextFields();
    await textFieldsPage.waitForScreen();

    const { validText } = testData.textField;
    await textFieldsPage.enterText(validText);
    const enteredText = await textFieldsPage.getEnteredText();

    expect(enteredText, 'entered text should match what was typed').to.equal(validText);
    Logger.info('Assertion passed: entered text matches expected value');
  });

  // Smoke 6 — Dialog
  it('opens a dialog, validates its message, and accepts it', async () => {
    Logger.info('Starting smoke test: dialog accept flow');
    await homePage.navigateToApp();
    await homePage.openCategory('Alert Dialogs');
    await dialogsPage.openMessageDialog();

    const isDisplayed = await dialogsPage.isDialogDisplayed();
    expect(isDisplayed, 'dialog message should be displayed').to.be.true;

    await dialogsPage.acceptDialog();
    await dialogsPage.waitUntil(
      async () => !(await dialogsPage.isDialogDisplayed()),
      'dialog should close after accepting',
    );
    Logger.info('Assertion passed: dialog validated and accepted');
  });
});
