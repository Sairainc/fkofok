import { UseFormRegister } from 'react-hook-form'

export type FormData = {
  gender: 'men' | 'women'
  phone_number: string
  party_type: string
  preferred_age_range: string
  preferred_personality: string[]
  preferred_style: string
  restaurant_preference: string
  preferred_areas: string[]
  birthdate_year: string
  birthdate_month: string
  birthdate_day: string
  prefecture: string
  city: string
  occupation: string
  available_dates: string[]
  personality: string[]
  photo_url: string
  mbti: string
  style: string
  appearance: string
  dating_experience: string
  vibe: string
  age: string
}

export interface FormProps {
  register: UseFormRegister<FormData>;
  userType?: 'men' | 'women';
  onNext: () => void;
  onPrev?: () => void;
} 