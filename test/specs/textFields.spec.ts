import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { ViewsPage } from '../../src/pages/ViewsPage.js';
import { TextFieldsPage } from '../../src/pages/TextFieldsPage.js';
import { Logger } from '../../src/utils/Logger.js';
import { FileUtils } from '../../src/utils/FileUtils.js';
import type { TestData } from '../../src/types/framework.types.js';

const testData = FileUtils.readJson<TestData>('test/data/testData.json');

describe('Text Field', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();
  const textFieldsPage = new TextFieldsPage();

  beforeEach(async () => {
    await homePage.restartApp();
    await homePage.waitForScreen();
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
  });

  // Test 3 — Text Field
  it('enters text into the text field and validates it', async () => {
    Logger.info('Starting test: text field entry');

    Logger.info('Navigating to Views > TextFields');
    await viewsPage.openTextFields();
    await textFieldsPage.waitForScreen();

    const { validText } = testData.textField;
    Logger.info(`Entering test data: "${validText}"`);
    await textFieldsPage.enterText(validText);

    const enteredText = await textFieldsPage.getEnteredText();
    expect(enteredText, 'entered text should match what was typed').to.equal(validText);
    Logger.info('Assertion passed: entered text matches expected value');
  });

  it('accepts numeric text into the text field', async () => {
    await viewsPage.openTextFields();
    await textFieldsPage.waitForScreen();

    const { numericText } = testData.textField;
    await textFieldsPage.enterText(numericText);

    const enteredText = await textFieldsPage.getEnteredText();
    expect(enteredText).to.equal(numericText);
  });
});
