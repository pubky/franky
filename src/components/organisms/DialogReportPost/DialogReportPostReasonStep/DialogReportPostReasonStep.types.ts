export interface DialogReportPostReasonStepProps {
  /** Current reason text */
  reason: string;
  /** True if reason has content */
  hasContent: boolean;
  /** True if submission is in progress */
  isSubmitting: boolean;
  /** Handler for reason textarea onChange */
  onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Handler to cancel/close the dialog */
  onCancel: () => void;
  /** Handler to submit the report */
  onSubmit: () => void;
}
