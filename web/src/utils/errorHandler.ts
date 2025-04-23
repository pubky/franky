type ErrorType = 'NOT_FOUND' | 'VALIDATION' | 'DATABASE' | 'API' | 'NETWORK' | 'UNKNOWN';

interface ErrorDetails {
  type: ErrorType;
  message: string;
  context?: Record<string, unknown>;
  statusCode?: number;
}

export class ErrorHandler {
  static handle(error: unknown, details: ErrorDetails): never {
    // Log the error with context
    console.error(`[${details.type}] ${details.message}`, {
      error,
      context: details.context,
      statusCode: details.statusCode
    });

    // You can add different behaviors based on error type
    switch (details.type) {
      case 'NOT_FOUND':
        throw new Error(`Resource not found: ${details.message}`);
      
      case 'VALIDATION':
        throw new Error(`Validation error: ${details.message}`);
      
      case 'DATABASE':
        // You might want to do something specific for database errors
        // Like retrying the operation or cleaning up
        throw new Error(`Database error: ${details.message}`);

      case 'API':
        throw new Error(`API error (${details.statusCode}): ${details.message}`);

      case 'NETWORK':
        throw new Error(`Network error: ${details.message}`);
      
      default:
        throw new Error(`Unexpected error: ${details.message}`);
    }
  }

  static async handleFetch(
    url: string,
    options?: RequestInit,
    context?: Record<string, unknown>
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        return this.handle(null, {
          type: 'API',
          message: `Request failed for ${url}`,
          statusCode: response.status,
          context: {
            ...context,
            url,
            status: response.status,
            statusText: response.statusText
          }
        });
      }

      return response;
    } catch (error) {
      return this.handle(error, {
        type: 'NETWORK',
        message: `Network request failed for ${url}`,
        context: {
          ...context,
          url,
          error
        }
      });
    }
  }

  static handleAsync<T>(
    operation: () => Promise<T>,
    errorDetails: Omit<ErrorDetails, 'message'> & { message: string | ((error: unknown) => string) }
  ): Promise<T> {
    return operation().catch((error) => {
      const message = typeof errorDetails.message === 'function' 
        ? errorDetails.message(error)
        : errorDetails.message;

      return this.handle(error, { ...errorDetails, message });
    });
  }
} 