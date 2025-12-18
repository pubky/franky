import * as Libs from '@/libs';

export type PubkyErrorName =
  | 'RequestError'
  | 'InvalidInput'
  | 'AuthenticationError'
  | 'PkarrError'
  | 'InternalError';

export type PubkyErrorDataLike = {
  statusCode?: number;
};

export type PubkyErrorLike = {
  name: PubkyErrorName | string;
  message: string;
  data?: unknown;
};

export type HomeserverOperation =
  | 'checkHomeserver'
  | 'signup'
  | 'signin'
  | 'generateAuthUrl'
  | 'logout'
  | 'restoreSession'
  | 'request'
  | 'putBlob'
  | 'list'
  | 'get'
  | 'generateSignupToken';

export type HomeserverErrorContext = {
  operation: HomeserverOperation;
  message: string;
  url?: string;
  method?: string;
  defaultType: Libs.AppErrorType;
  defaultStatusCode?: number;
  details?: Record<string, unknown>;
};

const isHomeserverErrorType = (value: unknown): value is Libs.HomeserverErrorType => {
  return typeof value === 'string' && (Object.values(Libs.HomeserverErrorType) as string[]).includes(value);
};

const extractStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;

  if ('statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number') {
    return (error as { statusCode: number }).statusCode;
  }

  if (!('data' in error)) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return undefined;
  if (!('statusCode' in data)) return undefined;
  const statusCode = (data as PubkyErrorDataLike).statusCode;
  return typeof statusCode === 'number' ? statusCode : undefined;
};

const isPubkyErrorLike = (error: unknown): error is PubkyErrorLike => {
  if (typeof error !== 'object' || error === null) return false;
  return (
    'name' in error &&
    typeof (error as { name?: unknown }).name === 'string' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
};

export function mapHomeserverError(error: unknown, ctx: HomeserverErrorContext): Libs.AppError {
  if (error instanceof Libs.AppError) return error;

  const extractedStatusCode = extractStatusCode(error);
  const statusCode = extractedStatusCode ?? ctx.defaultStatusCode ?? 500;

  const baseDetails: Record<string, unknown> = {
    operation: ctx.operation,
    url: ctx.url,
    method: ctx.method,
    statusCode,
    ...ctx.details,
  };

  if (isPubkyErrorLike(error)) {
    const pubkyName = error.name;

    if (pubkyName === 'InvalidInput') {
      return Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, error.message, 400, {
        ...baseDetails,
        pubkyErrorName: pubkyName,
        pubkyErrorData: error.data,
      });
    }

    if (pubkyName === 'AuthenticationError' || extractedStatusCode === 401) {
      return Libs.createHomeserverError(Libs.HomeserverErrorType.SESSION_EXPIRED, error.message || 'Session expired', 401, {
        ...baseDetails,
        pubkyErrorName: pubkyName,
        pubkyErrorData: error.data,
      });
    }

    return Libs.createHomeserverError(
      ctx.defaultType as Libs.HomeserverErrorType,
      ctx.message,
      statusCode,
      {
        ...baseDetails,
        pubkyErrorName: pubkyName,
        pubkyErrorData: error.data,
        originalError: error.message,
      },
    );
  }

  if (error instanceof Error) {
    if (extractedStatusCode === 401) {
      return Libs.createHomeserverError(Libs.HomeserverErrorType.SESSION_EXPIRED, error.message || 'Session expired', 401, {
        ...baseDetails,
        originalError: error.message,
      });
    }

    if (ctx.defaultType === Libs.CommonErrorType.INVALID_INPUT) {
      return Libs.createCommonError(Libs.CommonErrorType.INVALID_INPUT, error.message, 400, {
        ...baseDetails,
        originalError: error.message,
      });
    }

    return Libs.createHomeserverError(ctx.defaultType as Libs.HomeserverErrorType, ctx.message, statusCode, {
      ...baseDetails,
      originalError: error.message,
    });
  }

  // Non-Error thrown values: prefer homeserver error when caller provides a homeserver default type
  if (isHomeserverErrorType(ctx.defaultType)) {
    return Libs.createHomeserverError(ctx.defaultType as Libs.HomeserverErrorType, ctx.message, statusCode, {
      ...baseDetails,
      originalError: String(error),
    });
  }

  return Libs.createCommonError(
    Libs.CommonErrorType.NETWORK_ERROR,
    `An unexpected error occurred during ${ctx.message.toLowerCase()}`,
    statusCode,
    {
      ...baseDetails,
      error,
    },
  );
}
