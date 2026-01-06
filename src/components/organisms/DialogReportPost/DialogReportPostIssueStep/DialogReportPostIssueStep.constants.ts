import * as Libs from '@/libs';
import { REPORT_ISSUE_TYPES, type ReportIssueType } from '@/core/pipes/report';

/**
 * Icons for each issue type
 */
export const ISSUE_TYPE_ICONS: Record<ReportIssueType, React.ComponentType<{ className?: string }>> = {
  [REPORT_ISSUE_TYPES.PERSONAL_INFO]: Libs.IdCard,
  [REPORT_ISSUE_TYPES.HATE_SPEECH]: Libs.Frown,
  [REPORT_ISSUE_TYPES.HARASSMENT]: Libs.Hand,
  [REPORT_ISSUE_TYPES.CHILD_ABUSE]: Libs.Baby,
  [REPORT_ISSUE_TYPES.TERRORISM]: Libs.Flag,
  [REPORT_ISSUE_TYPES.VIOLENCE]: Libs.ShieldAlert,
  [REPORT_ISSUE_TYPES.ILLEGAL_SALES]: Libs.Briefcase,
  [REPORT_ISSUE_TYPES.SEXUAL_CONTENT]: Libs.Ban,
  [REPORT_ISSUE_TYPES.COPYRIGHT]: Libs.Copyright,
};
