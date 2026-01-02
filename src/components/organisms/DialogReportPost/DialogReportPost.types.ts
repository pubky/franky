export interface DialogReportPostProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Handler for dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Composite post ID in format "author:postId" */
  postId: string;
}
