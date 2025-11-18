import type { IframeHTMLAttributes } from 'react';

export interface IframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  /**
   * The source URL of the iframe
   */
  src: string;

  /**
   * The title of the iframe (for accessibility)
   */
  title: string;

  /**
   * Optional test ID for testing purposes
   */
  'data-testid'?: string;
}
