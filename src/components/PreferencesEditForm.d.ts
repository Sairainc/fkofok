declare module '@/components/PreferencesEditForm' {
  import { ReactNode } from 'react';
  
  interface PreferencesEditFormProps {
    userId: string;
    userGender: 'men' | 'women';
  }
  
  const PreferencesEditForm: React.ComponentType<PreferencesEditFormProps>;
  export default PreferencesEditForm;
} 