import { z } from 'zod';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/config';

/**
 * Schema for the copyright removal request form.
 * Validates all required fields and ensures at least one role is selected.
 */
export const copyrightFormSchema = z
  .object({
    isRightsOwner: z.boolean(),
    isReportingOnBehalf: z.boolean(),
    nameOwner: z.string().min(1, 'Name of rights owner is required'),
    originalContentUrls: z.string().min(1, 'Original content URLs are required'),
    briefDescription: z.string().min(1, 'Brief description is required'),
    infringingContentUrl: z.string().min(1, 'Infringing content URL is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email(VALIDATION_MESSAGES.INVALID_EMAIL),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .refine((val) => VALIDATION_PATTERNS.PHONE.test(val), {
        message: VALIDATION_MESSAGES.INVALID_PHONE,
      }),
    streetAddress: z.string().min(1, 'Street address is required'),
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    stateProvince: z.string().min(1, 'State/Province is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    signature: z.string().min(1, 'Signature is required'),
  })
  .refine((data) => data.isRightsOwner || data.isReportingOnBehalf, {
    message: VALIDATION_MESSAGES.ROLE_REQUIRED,
    path: ['isRightsOwner'],
  });

export type CopyrightFormData = z.infer<typeof copyrightFormSchema>;
