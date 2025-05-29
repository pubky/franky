import { env } from './env';

const isDebug = env.NEXT_PUBLIC_DEBUG_MODE;
const isTest = env.NODE_ENV === 'test' || Boolean(env.VITEST);

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isTest) return false; // Suppress all logs during tests
    if (level === 'error') return true; // Always log errors in non-test environments
    if (level === 'warn') return true; // Always log warnings in non-test environments
    return isDebug; // Only log debug and info in debug mode
  }

  debug(...args: unknown[]) {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: unknown[]) {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
