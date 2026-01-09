export interface HumanLightningPaymentProps {
  onBack: () => void;
  onSuccess: (signupCode: string, homeserverPubky: string) => void;
}
