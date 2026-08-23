import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { DialogsPage } from '../../src/pages/DialogsPage.js';
import { Logger } from '../../src/utils/Logger.js';

describe('Dialog', () => {
  const homePage = new HomePage();
  const dialogsPage = new DialogsPage();

  beforeEach(async () => {
    await homePage.restartApp();
    await homePage.waitForScreen();
    await homePage.navigateToApp();
    await homePage.openCategory('Alert Dialogs');
    await dialogsPage.waitForDisplayed(
      'android=new UiSelector().textContains("OK Cancel dialog with a message")',
    );
  });

  // Test 7 — Dialog
  it('opens a dialog, validates its message, and accepts it', async () => {
    Logger.info('Starting test: dialog accept flow');
    await dialogsPage.openMessageDialog();

    const isDisplayed = await dialogsPage.isDialogDisplayed();
    expect(isDisplayed, 'dialog message should be displayed').to.be.true;

    const message = await dialogsPage.getDialogMessage();
    expect(message, 'dialog message text should not be empty').to.have.length.greaterThan(0);
    Logger.info(`Dialog message: "${message}"`);

    await dialogsPage.acceptDialog();
    await dialogsPage.waitUntil(
      async () => !(await dialogsPage.isDialogDisplayed()),
      'dialog should close after accepting',
    );
    Logger.info('Assertion passed: dialog message validated and dialog accepted');
  });

  it('opens a dialog and cancels it', async () => {
    Logger.info('Starting test: dialog cancel flow');
    await dialogsPage.openMessageDialog();

    await dialogsPage.cancelDialog();
    await dialogsPage.waitUntil(
      async () => !(await dialogsPage.isDialogDisplayed()),
      'dialog should close after cancelling',
    );

    const isStillDisplayed = await dialogsPage.isDialogDisplayed();
    expect(isStillDisplayed, 'dialog should be dismissed after cancel').to.be.false;
    Logger.info('Assertion passed: dialog dismissed via cancel');
  });
});
