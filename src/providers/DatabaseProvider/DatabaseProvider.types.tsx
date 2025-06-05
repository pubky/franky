import { AppError } from '@/libs';

export interface DatabaseContextType {
  isReady: boolean;
  error: AppError | null;
  retry: () => Promise<void>;
}
