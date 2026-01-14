'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Molecules from '@/molecules';

const copyrightFormSchema = z.object({
  isRightsOwner: z.boolean(),
  isReportingOnBehalf: z.boolean(),
  nameOwner: z.string().min(1, 'Name of rights owner is required'),
  originalContentUrls: z.string().min(1, 'Original content URLs are required'),
  briefDescription: z.string().min(1, 'Brief description is required'),
  infringingContentUrl: z.string().min(1, 'Infringing content URL is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  signature: z.string().min(1, 'Signature is required'),
});

export type CopyrightFormData = z.infer<typeof copyrightFormSchema>;

const defaultValues: CopyrightFormData = {
  isRightsOwner: true,
  isReportingOnBehalf: false,
  nameOwner: '',
  originalContentUrls: '',
  briefDescription: '',
  infringingContentUrl: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  streetAddress: '',
  country: '',
  city: '',
  stateProvince: '',
  zipCode: '',
  signature: '',
};

export function useCopyrightForm() {
  const { toast } = Molecules.useToast();

  const form = useForm<CopyrightFormData>({
    resolver: zodResolver(copyrightFormSchema),
    defaultValues,
    mode: 'onSubmit',
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

  const onSubmit = form.handleSubmit(async (data) => {
    // Validate role selection
    if (!data.isRightsOwner && !data.isReportingOnBehalf) {
      form.setError('root', {
        message: 'Please select if you are the rights owner or reporting on behalf',
      });
      return;
    }

    await submitForm(data);
  });

  const handleRoleChange = (field: 'isRightsOwner' | 'isReportingOnBehalf', checked: boolean) => {
    if (field === 'isRightsOwner') {
      form.setValue('isRightsOwner', checked);
      if (checked) form.setValue('isReportingOnBehalf', false);
    } else {
      form.setValue('isReportingOnBehalf', checked);
      if (checked) form.setValue('isRightsOwner', false);
    }
  };

  return {
    form,
    onSubmit,
    handleRoleChange,
  };
}
