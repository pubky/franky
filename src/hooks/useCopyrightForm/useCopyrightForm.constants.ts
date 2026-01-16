import type { CopyrightFormData } from './useCopyrightForm.types';

/** Field names for role selection checkboxes */
export const COPYRIGHT_FORM_FIELDS = {
  IS_RIGHTS_OWNER: 'isRightsOwner',
  IS_REPORTING_ON_BEHALF: 'isReportingOnBehalf',
} as const;

export type RoleField = (typeof COPYRIGHT_FORM_FIELDS)[keyof typeof COPYRIGHT_FORM_FIELDS];

/** Default values for the copyright form */
export const copyrightFormDefaultValues: CopyrightFormData = {
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
