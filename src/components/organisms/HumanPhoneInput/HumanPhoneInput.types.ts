export interface HumanPhoneInputProps {
  onBack: () => void;
  onCodeSent: (phoneNumber: string) => void;
  initialPhoneNumber?: string;
}
