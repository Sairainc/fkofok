declare module '@/components/ProfileEditForm' {
  import { ReactNode } from 'react';
  
  interface ProfileEditFormProps {
    userId: string;
  }
  
  const ProfileEditForm: React.ComponentType<ProfileEditFormProps>;
  export default ProfileEditForm;
} 