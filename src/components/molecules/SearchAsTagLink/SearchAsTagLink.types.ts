/**
 * Props for SearchAsTagLink component
 */
export interface SearchAsTagLinkProps {
  /** Search query to use as tag */
  query: string;
  /** Callback when link is clicked */
  onClick: (query: string) => void;
}
