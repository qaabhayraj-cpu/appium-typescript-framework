/** Minimal log levels the framework cares about. */
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function timestamp(): string {
  return new Date().toISOString();
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  const line = `[${timestamp()}] [${level}] ${message}`;
  if (meta !== undefined) {
    (level === 'ERROR' ? console.error : console.log)(line, meta);
  } else {
    (level === 'ERROR' ? console.error : console.log)(line);
  }
}

/**
 * Small, dependency-free logger used throughout the framework. Keeps output
 * concise and consistent (`[INFO] ...`) so it reads well both in a local
 * terminal and inside CI/Allure logs.
 */
export const Logger = {
  info(message: string, meta?: unknown): void {
    write('INFO', message, meta);
  },
  warn(message: string, meta?: unknown): void {
    write('WARN', message, meta);
  },
  error(message: string, meta?: unknown): void {
    write('ERROR', message, meta);
  },
  debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      write('DEBUG', message, meta);
    }
  },
};
