import * as Core from '@/core';
import * as Libs from '@/libs';

export function ensureHttpResponseOk({ response, pubky }: Core.TBootstrapGuardParams) {
  if (!response.ok) {
    const errorType = Libs.mapHttpStatusToNexusErrorType(response.status);
    throw Libs.createNexusError(errorType, `Bootstrap request failed: ${response.statusText}`, response.status, {
      pubky,
      statusCode: response.status,
      statusText: response.statusText,
    });
  }
}

export async function parseBootstrapResponseOrThrow({
  response,
  pubky,
}: Core.TBootstrapGuardParams): Promise<Core.NexusBootstrapResponse> {
  let data: unknown;
  try {
    data = await response.json();
    return data as Core.NexusBootstrapResponse;
  } catch (error) {
    throw Libs.createNexusError(Libs.NexusErrorType.INVALID_RESPONSE, 'Failed to parse bootstrap response', 500, {
      error,
      pubky,
    });
  }
}
