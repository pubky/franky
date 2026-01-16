/**
 * Copyright controller types
 *
 * Types for copyright controller input parameters.
 * These match the raw API request body before validation.
 */

export interface TCopyrightSubmitParams {
  nameOwner: string;
  originalContentUrls: string;
  briefDescription: string;
  infringingContentUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  country: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  signature: string;
  isRightsOwner: boolean;
  isReportingOnBehalf: boolean;
}
