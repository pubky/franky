export interface CopyrightFormState {
  isRightsOwner: boolean;
  isReportingOnBehalf: boolean;
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
  loading: boolean;
  errors: Record<string, string>;
}

export interface CopyrightFormHandlers {
  setNameOwner: (value: string) => void;
  setOriginalContentUrls: (value: string) => void;
  setBriefDescription: (value: string) => void;
  setInfringingContentUrl: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setStreetAddress: (value: string) => void;
  setCountry: (value: string) => void;
  setCity: (value: string) => void;
  setStateProvince: (value: string) => void;
  setZipCode: (value: string) => void;
  setSignature: (value: string) => void;
  handleRightsOwnerChange: (checked: boolean) => void;
  handleReportingOnBehalfChange: (checked: boolean) => void;
  handleSubmit: () => Promise<void>;
}

export interface CopyrightFormHelpers {
  getStatus: (field: string) => 'error' | 'default';
  getMessageType: (field: string) => 'error' | 'default';
  currentDate: string;
}

export interface UseCopyrightFormReturn {
  state: CopyrightFormState;
  handlers: CopyrightFormHandlers;
  helpers: CopyrightFormHelpers;
}
