import type {
  TGetPriceResult,
  TCreateLnVerificationResult,
  TAwaitLnVerificationResult,
  TVerifySmsCodeParams,
  TVerifySmsCodeResult,
  TSendSmsCodeResult,
} from '@/core/services/homegate';

export type TGetLnVerificationPriceResult = TGetPriceResult;
export type THomegateCreateLnVerificationResult = TCreateLnVerificationResult;
export type THomegateAwaitLnVerificationResult = TAwaitLnVerificationResult;
export type THomegateVerifySmsCodeParams = TVerifySmsCodeParams;
export type THomegateVerifySmsCodeResult = TVerifySmsCodeResult;
export type THomegateSendSmsCodeResult = TSendSmsCodeResult;
