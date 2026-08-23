import { expect } from 'chai';
import { HomePage } from '../../src/pages/HomePage.js';
import { ViewsPage } from '../../src/pages/ViewsPage.js';
import { GestureUtils } from '../../src/utils/GestureUtils.js';
import { Logger } from '../../src/utils/Logger.js';

describe('Gestures', () => {
  const homePage = new HomePage();
  const viewsPage = new ViewsPage();

  beforeEach(async () => {
    await homePage.restartApp();
    await homePage.waitForScreen();
    await homePage.navigateToViews();
    await viewsPage.waitForScreen();
  });

  // Test 8 — Scroll
  it('scrolls the Views list to reveal rows outside the initial viewport', async () => {
    Logger.info('Starting test: scroll to reveal off-screen rows');

    const before = await viewsPage.getVisibleItemTexts();
    Logger.info(`Visible rows before scroll: ${before.length}`);

    await GestureUtils.swipeUp({ percentage: 0.8 });

    const after = await viewsPage.getVisibleItemTexts();
    Logger.info(`Visible rows after scroll: ${after.length}`);

    const newlyVisible = after.filter((text) => !before.includes(text));
    expect(after, 'the visible row set should change after scrolling').to.not.deep.equal(before);
    expect(
      newlyVisible.length,
      'at least one row that was off-screen should now be visible',
    ).to.be.greaterThan(0);
    Logger.info(`Assertion passed: ${newlyVisible.length} previously off-screen row(s) revealed`);
  });

  // Test 9 — Swipe
  it('swipes the Views list down and back up using the reusable gesture utility', async () => {
    Logger.info('Starting test: swipe gesture utility');

    await viewsPage.swipeList('up');
    const midScroll = await viewsPage.isScreenDisplayed();
    expect(midScroll, 'Views screen should remain displayed after swiping up').to.be.true;

    await viewsPage.swipeList('down');
    const afterReturn = await viewsPage.isScreenDisplayed();
    expect(afterReturn, 'Views screen should remain displayed after swiping back down').to.be.true;

    Logger.info('Assertion passed: swipe gestures executed without breaking the screen');
  });

  it('long-presses a list row without error', async () => {
    Logger.info('Starting test: long press gesture');
    await viewsPage.longPressFirstVisibleItem();

    const stillDisplayed = await viewsPage.isScreenDisplayed();
    expect(stillDisplayed, 'Views screen should remain displayed after a long press').to.be.true;
    Logger.info('Assertion passed: long press gesture executed cleanly');
  });
});
