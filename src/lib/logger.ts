const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (level === 'error') return true; // Always log errors
    if (level === 'warn') return true; // Always log warnings
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
