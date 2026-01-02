import { Env } from '@/libs/env';

/**
 * Mock sleep function
 * @param ms
 * @returns
 */
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TVerifySmsCodeResult = {
  /**
   * True if the code is valid, false otherwise.
   */
  valid: boolean;
  /**
   * The invite code to use for the user. Only set if the code is valid.
   */
  inviteCode?: string;
};

/**
 * Sends a json request to the homegate API. Handles errors and throws if the response is not OK.
 * @param path - The path to send the request to.
 * @param jsonBody - The json body to send with the request.
 * @returns The response from the request.
 */
async function sendRequest<T>(path: string, jsonBody: T): Promise<Response> {
  const url = new URL(path, Env.NEXT_PUBLIC_HOMEGATE_URL);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(jsonBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error(`Failed to send request to ${url}`, e);
    throw e;
  }

  return response;
}

async function logRequestError(response: Response, url: string) {
  let body = await response.text();
  try {
    body = JSON.parse(body);
  } catch {} // Not JSON, use the raw body

  console.error(`Failed to send request to ${url}`, response.status, response.statusText, body);
  return {
    status: response.status,
    statusText: response.statusText,
    body,
  };
}

/**
 * Result of sending a SMS code.
 * @property success - True if the request was successful, false otherwise.
 * @property retryAfter - The number of seconds to wait before retrying the request. Only set if the request was not successful.
 */
export interface ISendSmsCodeResult {
  success: boolean;
  retryAfter?: number;
}

/**
 * Homegate application class.
 * Responsible for handing out invite codes to users
 * in exchange for a human proof.
 * Possible proofs:
 * - SMS verification
 * - Payment
 */
export class Homegate {
  private constructor() {} // Prevent instantiation

  /**
   * Sends a SMS code to the user. This only errors on network errors.
   * Any phone number is valid to avoid user enumeration.
   * @param phoneNumber - The phone number to send the SMS code to.
   * @returns The result of the SMS code send request.
   */
  static async sendSmsCode(phoneNumber: string): Promise<ISendSmsCodeResult> {
    const response = await sendRequest('/sms_verification/send_code', { phone_number: phoneNumber });
    if (response.ok) {
      return {
        success: true,
        retryAfter: undefined,
      };
    }
    logRequestError(response, '/sms_verification/send_code');

    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      return {
        success: false,
        retryAfter: parseInt(retryAfter),
      };
    }
    return {
      success: false,
    };
  }

  /**
   * Verifies a SMS code for a given phone number.
   * @param phoneNumber - The phone number to verify the SMS code for.
   * @param code - The code to verify.
   * @returns The result of the verification.
   */
  static async verifySmsCode(phoneNumber: string, code: string): Promise<TVerifySmsCodeResult> {
    const response = await sendRequest('/sms_verification/verify_code', { phone_number: phoneNumber, code });
    if (response.ok) {
      const json = await response.json();
      return {
        valid: json.valid,
        inviteCode: json.invite_code,
      };
    }
    logRequestError(response, '/sms_verification/verify_code');
    throw new Error('Failed to verify sms code');
  }

  /**
   * Requests a Lightning invoice for the user to receive a invite code after the payment is confirmed.
   * @returns The Lightning invoice.
   */
  static async requestLightningInvoice(): Promise<string> {
    await sleep(1000); // Mock sleep for 1 second
    console.log('mock requestLightningInvoice');
    return 'lnbc1pv3n26035l50e7c6l0h64n57860h5l870zxtf7k72z560gdp2r6m34w1l06g0e502l4q48x7l78z9w6d25e7x3e4v3j6c30y70c1g23p';
  }
}
