import type {
  TCreateLnVerificationResult,
  TAwaitLnVerificationResult,
  TVerifySmsCodeResult,
  ISendSmsCodeResult,
  TSmsInfoResult,
  TLnInfoResult,
} from '@/core/services/homegate';

export type THomegateCreateLnVerificationResult = TCreateLnVerificationResult;
export type THomegateAwaitLnVerificationResult = TAwaitLnVerificationResult;
export type THomegateVerifySmsCodeResult = TVerifySmsCodeResult;
export type THomegateSendSmsCodeResult = ISendSmsCodeResult;
export type THomegateSmsInfoResult = TSmsInfoResult;
export type THomegateLnInfoResult = TLnInfoResult;
