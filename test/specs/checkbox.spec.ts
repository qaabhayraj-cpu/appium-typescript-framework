import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { ViewsPage } from '../../src/pages/ViewsPage.js';
import { Logger } from '../../src/utils/Logger.js';

describe('Checkbox and Radio Button', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();

  beforeEach(async () => {
    await homePage.waitForScreen();
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
  });

  // Test 4 — Checkbox
  it('selects a checkbox and validates its checked state', async () => {
    Logger.info('Starting test: checkbox selection');
    await viewsPage.openControlsLightTheme();

    const initiallyChecked = await viewsPage.isCheckboxChecked();
    Logger.info(`Checkbox initial state: ${initiallyChecked}`);

    await viewsPage.toggleCheckbox();

    const isChecked = await viewsPage.isCheckboxChecked();
    expect(isChecked, 'checkbox should toggle to the opposite state').to.equal(!initiallyChecked);
    Logger.info('Assertion passed: checkbox state toggled as expected');
  });

  // Test 5 — Radio Button
  it('selects a radio button option and validates its selected state', async () => {
    Logger.info('Starting test: radio button selection');
    await viewsPage.openRadioGroup();

    await viewsPage.selectRadioOption(0);
    const firstSelected = await viewsPage.isRadioOptionSelected(0);
    expect(firstSelected, 'first radio option should be selected after tapping it').to.be.true;

    await viewsPage.selectRadioOption(1);
    const secondSelected = await viewsPage.isRadioOptionSelected(1);
    const firstStillSelected = await viewsPage.isRadioOptionSelected(0);

    expect(secondSelected, 'second radio option should become selected').to.be.true;
    expect(firstStillSelected, 'first radio option should be deselected (mutually exclusive group)')
      .to.be.false;
    Logger.info('Assertion passed: radio group enforces single selection');
  });
});
