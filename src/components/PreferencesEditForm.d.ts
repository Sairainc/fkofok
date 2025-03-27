declare module '@/components/PreferencesEditForm' {
  interface PreferencesEditFormProps {
    userId: string;
    userGender: 'men' | 'women';
  }
  
  const PreferencesEditForm: React.ComponentType<PreferencesEditFormProps>;
  export default PreferencesEditForm;
} 