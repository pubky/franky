export interface DialogFeedbackContentProps {
  feedback: string;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  submit: () => void;
  isSubmitting: boolean;
  hasContent: boolean;
  currentUserPubky: string;
}
