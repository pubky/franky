'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { REPORT_ISSUE_LABELS, REPORT_ISSUE_TYPE_VALUES, type ReportIssueType } from '@/core/pipes/report';
import { ISSUE_TYPE_ICONS } from './DialogReportPostIssueStep.constants';
import type { DialogReportPostIssueStepProps } from './DialogReportPostIssueStep.types';

export function DialogReportPostIssueStep({ onSelectIssueType, onCancel }: DialogReportPostIssueStepProps) {
  const [selectedType, setSelectedType] = useState<ReportIssueType | null>(null);

  const handleSelect = (issueType: ReportIssueType) => {
    setSelectedType(issueType);
  };

  const handleNext = () => {
    if (selectedType) {
      onSelectIssueType(selectedType);
    }
  };

  return (
    <>
      <Atoms.DialogHeader>
        <Atoms.DialogTitle>Report Post</Atoms.DialogTitle>
        <Atoms.DialogDescription>What sort of issue are you reporting?</Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className="gap-1 py-2" role="listbox" aria-label="Issue types">
        {REPORT_ISSUE_TYPE_VALUES.map((issueType) => {
          const Icon = ISSUE_TYPE_ICONS[issueType as ReportIssueType];
          const isSelected = selectedType === issueType;
          const label = REPORT_ISSUE_LABELS[issueType as ReportIssueType];

          return (
            <Atoms.Button
              key={issueType}
              variant="ghost"
              role="option"
              aria-selected={isSelected}
              aria-label={label}
              className={Libs.cn(
                'h-auto w-full justify-start gap-3 rounded-lg px-3 py-3 hover:bg-muted',
                isSelected && 'bg-muted',
              )}
              onClick={() => handleSelect(issueType as ReportIssueType)}
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Atoms.Typography as="span" size="sm" className="flex-1 text-left text-foreground">
                {label}
              </Atoms.Typography>
              {isSelected && <Libs.Check className="size-5 shrink-0 text-foreground" aria-hidden="true" />}
            </Atoms.Button>
          );
        })}
      </Atoms.Container>

      <Atoms.DialogFooter className="flex-row gap-4">
        <Atoms.Button
          variant="secondary"
          size="lg"
          className="flex-1 rounded-full"
          onClick={onCancel}
          aria-label="Cancel report"
        >
          Cancel
        </Atoms.Button>
        <Atoms.Button
          variant="dark-outline"
          size="lg"
          className="flex-1 rounded-full"
          onClick={handleNext}
          disabled={!selectedType}
          aria-label="Continue to reason step"
        >
          Next
        </Atoms.Button>
      </Atoms.DialogFooter>
    </>
  );
}
