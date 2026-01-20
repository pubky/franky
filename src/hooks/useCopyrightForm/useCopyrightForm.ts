'use client';

import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Molecules from '@/molecules';
import { copyrightFormSchema, type CopyrightFormData, type RoleField } from './useCopyrightForm.types';
import { copyrightFormDefaultValues, COPYRIGHT_FORM_FIELDS } from './useCopyrightForm.constants';

export function useCopyrightForm() {
  const { toast } = Molecules.useToast();

  const form = useForm<CopyrightFormData>({
    resolver: zodResolver(copyrightFormSchema),
    defaultValues: copyrightFormDefaultValues,
    mode: 'onBlur',
  });

  const submitForm = async (data: CopyrightFormData) => {
    try {
      const response = await fetch('/api/copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      form.reset();
      toast({ title: 'Success', description: 'Request sent successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error sending request',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    }
  };

  const handleInvalidSubmit = (errors: FieldErrors<CopyrightFormData>) => {
    const [firstErrorField] = Object.keys(errors);
    if (!firstErrorField) return;

    const fieldElement =
      document.querySelector(`[name="${firstErrorField}"]`) ?? document.querySelector('[aria-invalid="true"]');

    if (fieldElement instanceof HTMLElement) {
      // Optional chaining handles test environments where these methods may not exist
      fieldElement.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      fieldElement.focus?.();
    }
  };

  const onSubmit = form.handleSubmit(submitForm, handleInvalidSubmit);

  const handleRoleChange = (field: RoleField, checked: boolean) => {
    const { IS_RIGHTS_OWNER, IS_REPORTING_ON_BEHALF } = COPYRIGHT_FORM_FIELDS;

    if (field === IS_RIGHTS_OWNER) {
      form.setValue(IS_RIGHTS_OWNER, checked);
      if (checked) form.setValue(IS_REPORTING_ON_BEHALF, false);
    } else {
      form.setValue(IS_REPORTING_ON_BEHALF, checked);
      if (checked) form.setValue(IS_RIGHTS_OWNER, false);
    }
    const nextIsRightsOwner = form.getValues(IS_RIGHTS_OWNER);
    const nextIsReportingOnBehalf = form.getValues(IS_REPORTING_ON_BEHALF);

    if (nextIsRightsOwner || nextIsReportingOnBehalf) {
      // Clear the role error when a valid selection is made
      form.clearErrors(IS_RIGHTS_OWNER);
    } else {
      // Re-validate to surface the role error immediately
      void form.trigger(IS_RIGHTS_OWNER);
    }
  };

  return {
    form,
    onSubmit,
    handleRoleChange,
  };
}
