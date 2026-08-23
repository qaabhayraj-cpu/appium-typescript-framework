import { BasePage } from './BasePage.js';
import { Logger } from '../utils/Logger.js';

/**
 * The ApiDemos landing screen — a single scrollable list of top-level
 * category names ("Views", "App", "Text", "Graphics", ...). Rows are plain
 * `TextView`s inside the standard Android list (`android:id/list`), so the
 * most stable way to target one is by its visible text (see
 * `BasePage.tapListItem`) rather than a resource-id, which the list shares
 * with every other list screen in the app.
 */
export class HomePage extends BasePage {
  private readonly list = 'android=new UiSelector().resourceId("android:id/list")';

  /** Verifies the ApiDemos home screen has loaded. */
  async isHomeScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.list);
  }

  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(this.list);
    Logger.info('ApiDemos home screen is displayed');
  }

  /** Taps a top-level category by its exact visible label, e.g. "Views" or "App". */
  async openCategory(label: string): Promise<void> {
    await this.tapListItem(label);
  }

  async navigateToViews(): Promise<void> {
    await this.openCategory('Views');
  }

  async navigateToApp(): Promise<void> {
    await this.openCategory('App');
  }
}
