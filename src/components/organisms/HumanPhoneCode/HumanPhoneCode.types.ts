export interface HumanPhoneCodeProps {
  phoneNumber: string;
  onBack: () => void;
  onSuccess: (inviteCode: string) => void;
}
