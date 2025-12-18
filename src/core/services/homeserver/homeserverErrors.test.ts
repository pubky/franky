import { describe, it, expect } from 'vitest';

import * as Libs from '@/libs';

import { mapHomeserverError } from './homeserverErrors';

describe('mapHomeserverError', () => {
  it('maps Pubky InvalidInput to CommonErrorType.INVALID_INPUT (400)', () => {
    const error = {
      name: 'InvalidInput',
      message: 'Invalid capability entries: /pub/bad',
      data: { statusCode: 400 },
    };

    const mapped = mapHomeserverError(error, {
      operation: 'generateAuthUrl',
      message: 'Failed to generate auth URL',
      defaultType: Libs.HomeserverErrorType.AUTH_REQUEST_FAILED,
      url: 'caps',
    });

    expect(mapped).toMatchObject({
      type: Libs.CommonErrorType.INVALID_INPUT,
      statusCode: 400,
      message: error.message,
    });
  });

  it('maps Pubky AuthenticationError to HomeserverErrorType.SESSION_EXPIRED (401)', () => {
    const error = {
      name: 'AuthenticationError',
      message: 'Session expired',
      data: { statusCode: 401 },
    };

    const mapped = mapHomeserverError(error, {
      operation: 'request',
      message: 'Failed to fetch data',
      defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
      url: 'pubky://user/pub/data.json',
      method: 'GET',
    });

    expect(mapped).toMatchObject({
      type: Libs.HomeserverErrorType.SESSION_EXPIRED,
      statusCode: 401,
      message: error.message,
    });
  });

  it('maps Pubky RequestError to the operation defaultType with statusCode', () => {
    const error = {
      name: 'RequestError',
      message: 'Not Found',
      data: { statusCode: 404 },
    };

    const mapped = mapHomeserverError(error, {
      operation: 'request',
      message: 'Failed to fetch data',
      defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
      url: 'pubky://user/pub/missing.json',
      method: 'GET',
    });

    expect(mapped).toMatchObject({
      type: Libs.HomeserverErrorType.FETCH_FAILED,
      statusCode: 404,
      message: 'Failed to fetch data',
    });
    expect(mapped.details?.originalError).toBe('Not Found');
  });

  it('maps Pubky RequestError to PUT_FAILED for putBlob operations', () => {
    const error = {
      name: 'RequestError',
      message: 'Payload Too Large',
      data: { statusCode: 413 },
    };

    const mapped = mapHomeserverError(error, {
      operation: 'putBlob',
      message: 'Failed to PUT blob data',
      defaultType: Libs.HomeserverErrorType.PUT_FAILED,
      url: 'pubky://user/pub/large.bin',
      method: 'PUT',
    });

    expect(mapped).toMatchObject({
      type: Libs.HomeserverErrorType.PUT_FAILED,
      statusCode: 413,
      message: 'Failed to PUT blob data',
    });
    expect(mapped.details?.originalError).toBe('Payload Too Large');
  });

  it('wraps generic Error instances using the operation defaultType', () => {
    const error = new Error('Network request failed');

    const mapped = mapHomeserverError(error, {
      operation: 'list',
      message: 'Failed to list files',
      defaultType: Libs.HomeserverErrorType.FETCH_FAILED,
      url: 'pubky://user/pub/pubky.app/',
    });

    expect(mapped).toMatchObject({
      type: Libs.HomeserverErrorType.FETCH_FAILED,
      statusCode: 500,
      message: 'Failed to list files',
    });
    expect(mapped.details?.originalError).toBe('Network request failed');
  });
});

