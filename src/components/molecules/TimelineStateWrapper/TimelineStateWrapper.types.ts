import { ReactNode } from 'react';

export interface TimelineStateWrapperProps {
  /**
   * Whether initial loading is in progress
   */
  loading: boolean;
  /**
   * Error message (if any)
   */
  error: string | null;
  /**
   * Whether there are items to display
   */
  hasItems: boolean;
  /**
   * Content to render when not in loading/error/empty state
   */
  children: ReactNode;
  /**
   * Optional custom loading component
   */
  loadingComponent?: ReactNode;
  /**
   * Optional custom error component
   */
  errorComponent?: ReactNode;
  /**
   * Optional custom empty component
   */
  emptyComponent?: ReactNode;
}
