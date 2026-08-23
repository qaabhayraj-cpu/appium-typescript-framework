import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { ViewsPage } from '../../src/pages/ViewsPage.js';
import { Logger } from '../../src/utils/Logger.js';

describe('Navigation', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();

  // Test 1 — Application Launch
  it('launches the ApiDemos app and displays the home screen', async () => {
    Logger.info('Starting test: application launch');
    await homePage.waitForScreen();

    const isDisplayed = await homePage.isHomeScreenDisplayed();
    expect(isDisplayed, 'home screen should be displayed after launch').to.be.true;
    Logger.info('Assertion passed: home screen displayed');
  });

  // Test 2 — Navigate to Views
  it('navigates from Home to the Views screen', async () => {
    Logger.info('Starting test: navigate to Views');
    await homePage.waitForScreen();

    Logger.info('Navigating to Views');
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();

    const isDisplayed = await viewsPage.isScreenDisplayed();
    expect(isDisplayed, 'Views screen should be displayed after navigation').to.be.true;
    Logger.info('Assertion passed: Views screen displayed');
  });
});
