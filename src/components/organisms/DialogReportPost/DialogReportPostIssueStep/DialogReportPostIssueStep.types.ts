import type { ReportIssueType } from '@/core/pipes/report';

export interface DialogReportPostIssueStepProps {
  /** Handler when an issue type is selected and Next is clicked */
  onSelectIssueType: (issueType: ReportIssueType) => void;
  /** Handler when Cancel is clicked */
  onCancel: () => void;
}
