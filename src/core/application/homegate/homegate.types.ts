import type {
  TGetPriceResult,
  TCreateLnVerificationResult,
  TAwaitLnVerificationResult,
  TVerifySmsCodeResult,
  ISendSmsCodeResult,
} from '@/core/services/homegate';

export type TGetLnVerificationPriceResult = TGetPriceResult;
export type THomegateCreateLnVerificationResult = TCreateLnVerificationResult;
export type THomegateAwaitLnVerificationResult = TAwaitLnVerificationResult;
export type THomegateVerifySmsCodeResult = TVerifySmsCodeResult;
export type THomegateSendSmsCodeResult = ISendSmsCodeResult;
