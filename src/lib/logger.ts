import { env } from './env';

const isDebug = env.NEXT_PUBLIC_DEBUG_MODE;
const isTest = env.NODE_ENV === 'test' || Boolean(env.VITEST);

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private constructor() {}

  static shouldLog(level: LogLevel): boolean {
    if (isTest) return false; // Don't log during tests unless explicitly enabled
    if (level === 'error') return true; // Always log errors in non-test environments
    if (level === 'warn') return true; // Always log warnings in non-test environments
    return isDebug; // Only log debug and info in debug mode
  }

  static debug(...args: unknown[]) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  }

  static info(...args: unknown[]) {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  static warn(...args: unknown[]) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  static error(...args: unknown[]) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }
}
