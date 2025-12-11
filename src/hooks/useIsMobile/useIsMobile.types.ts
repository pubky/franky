import * as Config from '@/config';

export interface UseIsMobileOptions {
  /**
   * Breakpoint threshold (default: 'lg' = 1024px)
   * Viewport width below this value is considered mobile
   */
  breakpoint?: Config.Breakpoint;
  /**
   * Debounce delay in milliseconds (default: 150ms)
   * Prevents excessive re-renders during window resize
   */
  debounceMs?: number;
}
