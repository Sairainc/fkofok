export interface FormProps {
  register: UseFormRegister<any>;  // ここは具体的な型に置き換えることを推奨
  onNext?: () => void;
  onPrev?: () => void;
  userType?: string;
} 