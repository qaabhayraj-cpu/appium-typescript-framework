import fs from 'node:fs';
import path from 'node:path';

/** Small filesystem helpers shared by the reporting/screenshot utilities. */
export const FileUtils = {
  /** Ensures a directory exists (recursively), creating it if necessary. */
  ensureDirectory(directoryPath: string): string {
    const absolutePath = path.isAbsolute(directoryPath)
      ? directoryPath
      : path.resolve(process.cwd(), directoryPath);

    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }
    return absolutePath;
  },

  /** Produces a filesystem-safe date stamp, e.g. `2026-08-23`. */
  dateStamp(date: Date = new Date()): string {
    return date.toISOString().split('T')[0] ?? date.toISOString();
  },

  /** Produces a filesystem-safe timestamp with time, e.g. `2026-08-23T18-42-05`. */
  timeStamp(date: Date = new Date()): string {
    return date.toISOString().replace(/:/g, '-').split('.')[0] ?? String(date.getTime());
  },

  /** Strips characters that are unsafe in file names, replacing them with `_`. */
  sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_');
  },

  /**
   * Reads and parses a JSON file, resolved relative to the current working
   * directory (the project root when run via `wdio`/`npm`). Used to load
   * `test/data/testData.json` without relying on ESM JSON import-attribute
   * syntax, which varies across TypeScript/Node versions.
   */
  readJson<T>(relativeOrAbsolutePath: string): T {
    const absolutePath = path.isAbsolute(relativeOrAbsolutePath)
      ? relativeOrAbsolutePath
      : path.resolve(process.cwd(), relativeOrAbsolutePath);
    const raw = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(raw) as T;
  },
};
