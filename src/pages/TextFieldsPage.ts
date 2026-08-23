import { BasePage } from './BasePage.js';
import { AppConstants } from '../constants/appConstants.js';

/**
 * Views → Controls → "9. TextFields" — a screen with a single free-text
 * `EditText` used to validate text entry. Reached via
 * `ViewsPage.openControlsTextFields()`.
 */
export class TextFieldsPage extends BasePage {
  private readonly editText = `android=new UiSelector().resourceId("${AppConstants.APP_PACKAGE}:id/edit")`;

  async waitForScreen(): Promise<void> {
    await this.waitForDisplayed(this.editText);
  }

  async isScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.editText);
  }

  async enterText(text: string): Promise<void> {
    await this.setValue(this.editText, text);
  }

  async getEnteredText(): Promise<string> {
    return this.getText(this.editText);
  }

  async clearText(): Promise<void> {
    await this.clearValue(this.editText);
  }
}
