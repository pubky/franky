import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { TCopyrightSubmitParams } from './copyright.types';

const testData = {
  nameOwner: 'John Doe',
  originalContentUrls: 'https://example.com/original',
  briefDescription: 'Original artwork',
  infringingContentUrl: 'https://example.com/infringing',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '123-456-7890',
  streetAddress: '123 Main St',
  country: 'United States',
  city: 'New York',
  stateProvince: 'NY',
  zipCode: '10001',
  signature: 'John Doe',
  isRightsOwner: true,
  isReportingOnBehalf: false,
};

const createCopyrightParams = (overrides: Partial<TCopyrightSubmitParams> = {}): TCopyrightSubmitParams => ({
  ...testData,
  ...overrides,
});

describe('CopyrightController', () => {
  let CopyrightController: typeof import('./copyright').CopyrightController;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock CopyrightApplication
    vi.spyOn(Core.CopyrightApplication, 'submit').mockResolvedValue(undefined);

    // Import CopyrightController
    const copyrightModule = await import('./copyright');
    CopyrightController = copyrightModule.CopyrightController;
  });

  describe('submit', () => {
    it('should pass validated params to application layer', async () => {
      const params = createCopyrightParams();
      const submitSpy = vi.spyOn(Core.CopyrightApplication, 'submit');

      await CopyrightController.submit(params);

      expect(submitSpy).toHaveBeenCalledWith({
        nameOwner: testData.nameOwner,
        originalContentUrls: testData.originalContentUrls,
        briefDescription: testData.briefDescription,
        infringingContentUrl: testData.infringingContentUrl,
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email.toLowerCase(),
        phoneNumber: testData.phoneNumber,
        streetAddress: testData.streetAddress,
        country: testData.country,
        city: testData.city,
        stateProvince: testData.stateProvince,
        zipCode: testData.zipCode,
        signature: testData.signature,
        isRightsOwner: true,
        isReportingOnBehalf: false,
      });
    });

    it('should throw when nameOwner is missing', async () => {
      const params = createCopyrightParams({ nameOwner: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Name of rights owner is required');
    });

    it('should throw when originalContentUrls is missing', async () => {
      const params = createCopyrightParams({ originalContentUrls: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Original content URLs is required');
    });

    it('should throw when briefDescription is missing', async () => {
      const params = createCopyrightParams({ briefDescription: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Brief description is required');
    });

    it('should throw when infringingContentUrl is missing', async () => {
      const params = createCopyrightParams({ infringingContentUrl: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Infringing content URL is required');
    });

    it('should throw when firstName is missing', async () => {
      const params = createCopyrightParams({ firstName: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('First name is required');
    });

    it('should throw when lastName is missing', async () => {
      const params = createCopyrightParams({ lastName: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Last name is required');
    });

    it('should throw when email is missing', async () => {
      const params = createCopyrightParams({ email: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Email is required');
    });

    it('should throw when email is invalid', async () => {
      const params = createCopyrightParams({ email: 'invalid-email' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Please enter a valid email address');
    });

    it('should throw when phoneNumber is missing', async () => {
      const params = createCopyrightParams({ phoneNumber: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Phone number is required');
    });

    it('should throw when streetAddress is missing', async () => {
      const params = createCopyrightParams({ streetAddress: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Street address is required');
    });

    it('should throw when country is missing', async () => {
      const params = createCopyrightParams({ country: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Country is required');
    });

    it('should throw when city is missing', async () => {
      const params = createCopyrightParams({ city: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('City is required');
    });

    it('should throw when stateProvince is missing', async () => {
      const params = createCopyrightParams({ stateProvince: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('State/Province is required');
    });

    it('should throw when zipCode is missing', async () => {
      const params = createCopyrightParams({ zipCode: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Zip code is required');
    });

    it('should throw when signature is missing', async () => {
      const params = createCopyrightParams({ signature: '' });

      await expect(CopyrightController.submit(params)).rejects.toThrow('Signature is required');
    });

    it('should throw when neither role checkbox is selected', async () => {
      const params = createCopyrightParams({ isRightsOwner: false, isReportingOnBehalf: false });

      await expect(CopyrightController.submit(params)).rejects.toThrow(
        'Please select if you are the rights owner or reporting on behalf',
      );
    });

    it('should accept when isRightsOwner is true', async () => {
      const params = createCopyrightParams({ isRightsOwner: true, isReportingOnBehalf: false });
      const submitSpy = vi.spyOn(Core.CopyrightApplication, 'submit');

      await CopyrightController.submit(params);

      expect(submitSpy).toHaveBeenCalled();
    });

    it('should accept when isReportingOnBehalf is true', async () => {
      const params = createCopyrightParams({ isRightsOwner: false, isReportingOnBehalf: true });
      const submitSpy = vi.spyOn(Core.CopyrightApplication, 'submit');

      await CopyrightController.submit(params);

      expect(submitSpy).toHaveBeenCalled();
    });

    it('should trim whitespace from inputs', async () => {
      const params = createCopyrightParams({
        nameOwner: '  John Doe  ',
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
      });
      const submitSpy = vi.spyOn(Core.CopyrightApplication, 'submit');

      await CopyrightController.submit(params);

      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          nameOwner: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }),
      );
    });

    it('should throw when application layer fails', async () => {
      vi.spyOn(Core.CopyrightApplication, 'submit').mockRejectedValue(new Error('Application error'));

      const params = createCopyrightParams();

      await expect(CopyrightController.submit(params)).rejects.toThrow('Application error');
    });
  });
});
