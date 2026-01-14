import { useState, useCallback, useMemo } from 'react';
import * as Molecules from '@/molecules';
import type { UseCopyrightFormReturn } from './useCopyrightForm.types';

/**
 * Custom hook for managing copyright form state and logic
 *
 * Extracts form state management, validation, and submission logic
 * from the CopyrightForm component for better separation of concerns.
 */
export function useCopyrightForm(): UseCopyrightFormReturn {
  const { toast } = Molecules.useToast();

  // Form state
  const [isRightsOwner, setIsRightsOwner] = useState(true);
  const [isReportingOnBehalf, setIsReportingOnBehalf] = useState(false);
  const [nameOwner, setNameOwner] = useState('');
  const [originalContentUrls, setOriginalContentUrls] = useState('');
  const [briefDescription, setBriefDescription] = useState('');
  const [infringingContentUrl, setInfringingContentUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Email validation
  const isValidEmail = useCallback((emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRightsOwner && !isReportingOnBehalf) {
      newErrors.role = 'Please select if you are the rights owner or reporting on behalf';
    }
    if (!nameOwner.trim()) newErrors.nameOwner = 'Name of rights owner is required';
    if (!originalContentUrls.trim()) newErrors.originalContentUrls = 'Original content URLs are required';
    if (!briefDescription.trim()) newErrors.briefDescription = 'Brief description is required';
    if (!infringingContentUrl.trim()) newErrors.infringingContentUrl = 'Infringing content URL is required';
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!stateProvince.trim()) newErrors.stateProvince = 'State/Province is required';
    if (!zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!signature.trim()) newErrors.signature = 'Signature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    isRightsOwner,
    isReportingOnBehalf,
    nameOwner,
    originalContentUrls,
    briefDescription,
    infringingContentUrl,
    firstName,
    lastName,
    email,
    phoneNumber,
    streetAddress,
    country,
    city,
    stateProvince,
    zipCode,
    signature,
    isValidEmail,
  ]);

  // Reset form
  const resetForm = useCallback(() => {
    setNameOwner('');
    setOriginalContentUrls('');
    setBriefDescription('');
    setInfringingContentUrl('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setStreetAddress('');
    setCountry('');
    setCity('');
    setStateProvince('');
    setZipCode('');
    setSignature('');
    setIsRightsOwner(true);
    setIsReportingOnBehalf(false);
    setErrors({});
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameOwner,
          originalContentUrls,
          briefDescription,
          infringingContentUrl,
          firstName,
          lastName,
          email,
          phoneNumber,
          streetAddress,
          country,
          city,
          stateProvince,
          zipCode,
          signature,
          isRightsOwner,
          isReportingOnBehalf,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit request');
      }

      resetForm();
      toast({ title: 'Success', description: 'Request sent successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error sending request',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    nameOwner,
    originalContentUrls,
    briefDescription,
    infringingContentUrl,
    firstName,
    lastName,
    email,
    phoneNumber,
    streetAddress,
    country,
    city,
    stateProvince,
    zipCode,
    signature,
    isRightsOwner,
    isReportingOnBehalf,
    resetForm,
    toast,
  ]);

  // Checkbox handlers
  const handleRightsOwnerChange = useCallback((checked: boolean) => {
    setIsRightsOwner(checked);
    if (checked) setIsReportingOnBehalf(false);
  }, []);

  const handleReportingOnBehalfChange = useCallback((checked: boolean) => {
    setIsReportingOnBehalf(checked);
    if (checked) setIsRightsOwner(false);
  }, []);

  // Current date for display
  const currentDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    [],
  );

  // Helper to get field status
  const getStatus = useCallback(
    (field: string): 'error' | 'default' => (errors[field] ? 'error' : 'default'),
    [errors],
  );

  const getMessageType = useCallback(
    (field: string): 'error' | 'default' => (errors[field] ? 'error' : 'default'),
    [errors],
  );

  return {
    state: {
      isRightsOwner,
      isReportingOnBehalf,
      nameOwner,
      originalContentUrls,
      briefDescription,
      infringingContentUrl,
      firstName,
      lastName,
      email,
      phoneNumber,
      streetAddress,
      country,
      city,
      stateProvince,
      zipCode,
      signature,
      loading,
      errors,
    },
    handlers: {
      setNameOwner,
      setOriginalContentUrls,
      setBriefDescription,
      setInfringingContentUrl,
      setFirstName,
      setLastName,
      setEmail,
      setPhoneNumber,
      setStreetAddress,
      setCountry,
      setCity,
      setStateProvince,
      setZipCode,
      setSignature,
      handleRightsOwnerChange,
      handleReportingOnBehalfChange,
      handleSubmit,
    },
    helpers: {
      getStatus,
      getMessageType,
      currentDate,
    },
  };
}
