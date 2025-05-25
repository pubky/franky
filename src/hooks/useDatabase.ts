import { useContext } from 'react';
import { DatabaseContext } from '@/providers/DatabaseProvider';

export function useDatabase() {
  const context = useContext(DatabaseContext);
  
  if (context === null) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  
  return context;
} 