import path from 'node:path';
import allureReporter from '@wdio/allure-reporter';
import { AppConstants } from '../constants/appConstants.js';
import { FileUtils } from './FileUtils.js';
import { Logger } from './Logger.js';

/**
 * Screenshot capture, used both for on-demand debugging screenshots and for
 * automatic failure screenshots (see the `afterTest` hook in the wdio
 * configs). Files are named meaningfully, e.g.:
 *
 *   screenshots/failed_TextFieldTest_2026-08-23.png
 *   screenshots/TextFieldTest_2026-08-23T18-42-05.png
 */
export const ScreenshotUtils = {
  /** Takes a screenshot and saves it under `screenshots/`, returning the absolute path. */
  async capture(name: string, prefix?: string): Promise<string> {
    const directory = FileUtils.ensureDirectory(AppConstants.DIRECTORIES.SCREENSHOTS);
    const safeName = FileUtils.sanitizeFileName(name);
    const fileNameParts = [prefix, safeName, FileUtils.timeStamp()].filter(Boolean);
    const fileName = `${fileNameParts.join('_')}.png`;
    const filePath = path.join(directory, fileName);

    await browser.saveScreenshot(filePath);
    Logger.info(`Screenshot saved: ${filePath}`);

    // Attach to the Allure report so failures are visible directly in the
    // HTML report, not just on disk.
    allureReporter.addAttachment(fileName, filePath, 'image/png');

    return filePath;
  },

  /**
   * Convenience wrapper used from failure hooks — produces file names like
   * `failed_TextFieldTest_2026-08-23.png` as required by the framework spec.
   */
  async captureOnFailure(testTitle: string): Promise<string> {
    const directory = FileUtils.ensureDirectory(AppConstants.DIRECTORIES.SCREENSHOTS);
    const safeName = FileUtils.sanitizeFileName(testTitle);
    const fileName = `failed_${safeName}_${FileUtils.dateStamp()}.png`;
    const filePath = path.join(directory, fileName);

    await browser.saveScreenshot(filePath);
    Logger.error(`Test failed — screenshot saved: ${filePath}`);
    allureReporter.addAttachment(fileName, filePath, 'image/png');

    return filePath;
  },
};
