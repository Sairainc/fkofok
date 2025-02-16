import { UseFormRegister } from 'react-hook-form'

export interface FormData {
  gender: string;
  phone_number: string;
  birthdate: string;
  prefecture: string;
  occupation: string;
  available_dates: string[];
  // 他のフォームフィールドも追加
}

export interface FormProps {
  register: UseFormRegister<FormData>;
  userType?: 'men' | 'women';
  onNext: () => void;
  onPrev?: () => void;
} 