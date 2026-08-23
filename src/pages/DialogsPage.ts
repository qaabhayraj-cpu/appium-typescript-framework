import { BasePage } from './BasePage.js';

/**
 * App → Alert Dialogs — a list of buttons that each launch a different
 * native `AlertDialog` variant. The framework exercises the "OK Cancel
 * dialog with a message" sample, which is representative of the standard
 * accept/cancel dialog pattern used throughout Android.
 */
export class DialogsPage extends BasePage {
  private readonly messageDialogTrigger = 'OK Cancel dialog with a message';

  // Standard AOSP AlertDialog ids — stable across the OS, not the app.
  private readonly dialogMessage = 'android=new UiSelector().resourceId("android:id/message")';
  private readonly okButton = 'android=new UiSelector().resourceId("android:id/button1")';
  private readonly cancelButton = 'android=new UiSelector().resourceId("android:id/button2")';

  async isScreenDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.listItemSelector(this.messageDialogTrigger));
  }

  async openMessageDialog(): Promise<void> {
    await this.tapListItem(this.messageDialogTrigger);
    await this.waitForDisplayed(this.dialogMessage);
  }

  async isDialogDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.dialogMessage);
  }

  async getDialogMessage(): Promise<string> {
    return this.getText(this.dialogMessage);
  }

  async acceptDialog(): Promise<void> {
    await this.click(this.okButton);
  }

  async cancelDialog(): Promise<void> {
    await this.click(this.cancelButton);
  }
}
