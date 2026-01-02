import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Atoms from '@/atoms';
import { DialogReportPostIssueStep } from './DialogReportPostIssueStep';
import { REPORT_ISSUE_TYPES, REPORT_ISSUE_LABELS } from '@/core/pipes/report';

// Mock @/libs - use actual implementations and only stub cn helper
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
  };
});

const renderWithDialog = (component: React.ReactElement) => {
  return render(
    <Atoms.Dialog open={true}>
      <Atoms.DialogContent>{component}</Atoms.DialogContent>
    </Atoms.Dialog>,
  );
};

describe('DialogReportPostIssueStep', () => {
  const mockOnSelectIssueType = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct title and description', () => {
    renderWithDialog(<DialogReportPostIssueStep onSelectIssueType={mockOnSelectIssueType} onCancel={mockOnCancel} />);

    expect(screen.getByText('Report Post')).toBeInTheDocument();
    expect(screen.getByText('What sort of issue are you reporting?')).toBeInTheDocument();
  });

  it('renders all issue type options', () => {
    renderWithDialog(<DialogReportPostIssueStep onSelectIssueType={mockOnSelectIssueType} onCancel={mockOnCancel} />);

    Object.values(REPORT_ISSUE_TYPES).forEach((issueType) => {
      const label = REPORT_ISSUE_LABELS[issueType];
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls onSelectIssueType with correct issue type when Next button is clicked after selecting issue', async () => {
    const user = userEvent.setup();
    renderWithDialog(<DialogReportPostIssueStep onSelectIssueType={mockOnSelectIssueType} onCancel={mockOnCancel} />);

    // First select an issue type
    const firstIssueButton = screen.getByLabelText(REPORT_ISSUE_LABELS[REPORT_ISSUE_TYPES.PERSONAL_INFO]);
    await user.click(firstIssueButton);

    // Then click Next button
    const nextButton = screen.getByRole('button', { name: 'Continue to reason step' });
    await user.click(nextButton);

    expect(mockOnSelectIssueType).toHaveBeenCalledWith(REPORT_ISSUE_TYPES.PERSONAL_INFO);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithDialog(<DialogReportPostIssueStep onSelectIssueType={mockOnSelectIssueType} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel report' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});

describe('DialogReportPostIssueStep - Snapshots', () => {
  const mockOnSelectIssueType = vi.fn();
  const mockOnCancel = vi.fn();

  it('matches snapshot', () => {
    const { container } = renderWithDialog(
      <DialogReportPostIssueStep onSelectIssueType={mockOnSelectIssueType} onCancel={mockOnCancel} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
