import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Step 1のスキーマ
const step1Schema = z.object({
  gender: z.enum(['men', 'women'], {
    required_error: '性別を選択してください',
  }),
  phone_number: z
    .string()
    .min(10, '電話番号が短すぎます')
    .max(11, '電話番号が長すぎます')
    .regex(/^[0-9]+$/, '数字のみ入力してください')
    .transform((val) => val.replace(/[^0-9]/g, '')),
});

// Step 2のスキーマ
const step2Schema = z.object({
  party_type: z.enum(['fun', 'serious'], {
    required_error: '希望する合コンタイプを選択してください',
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

type RegistrationFormProps = {
  userId: string;
};

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Step1Data | null>(null);
  const router = useRouter();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  const handleStep1Submit = async (data: Step1Data) => {
    setFormData(data);
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      const uuid = crypto.randomUUID();

      // プロフィールの作成
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: uuid,
          line_id: userId,
          gender: formData.gender,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 選択した性別に応じてpreferencesテーブルを選択
      const preferencesTable = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      
      // 好みの登録
      const { error: prefError } = await supabase
        .from(preferencesTable)
        .upsert({
          id: crypto.randomUUID(),
          line_id: userId,
          party_type: data.party_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (prefError) throw prefError;

      setIsSubmitted(true);
      router.push('/payment');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('エラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            登録完了
          </h2>
          <p className="text-gray-600">
            基本情報の登録が完了しました。
            次のステップに進みます...
          </p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
            <p className="text-sm text-gray-600 mt-2">まずは基本的な情報を教えてください</p>
          </div>
          
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                あなたの性別*
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${step1Form.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                  ${step1Form.watch('gender') === 'men' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                  <input
                    type="radio"
                    value="men"
                    {...step1Form.register('gender')}
                    className="sr-only"
                  />
                  男性
                </label>
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${step1Form.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                  ${step1Form.watch('gender') === 'women' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                  <input
                    type="radio"
                    value="women"
                    {...step1Form.register('gender')}
                    className="sr-only"
                  />
                  女性
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                電話番号(非公開)*
              </label>
              <input
                type="tel"
                {...step1Form.register('phone_number')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${step1Form.formState.errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
              />
            </div>

            <button
              type="submit"
              disabled={!step1Form.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                '次に進む'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">希望する合コンタイプ</h2>
          <p className="text-sm text-gray-600 mt-2">あなたの希望に合った合コンをご紹介します</p>
        </div>
        
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
              ${step2Form.formState.errors.party_type ? 'border-red-500' : 'border-gray-300'}
              ${step2Form.watch('party_type') === 'fun' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                value="fun"
                {...step2Form.register('party_type')}
                className="sr-only"
              />
              ワイワイノリ重視
            </label>
            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
              ${step2Form.formState.errors.party_type ? 'border-red-500' : 'border-gray-300'}
              ${step2Form.watch('party_type') === 'serious' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                value="serious"
                {...step2Form.register('party_type')}
                className="sr-only"
              />
              真剣な恋愛
            </label>
          </div>

          <button
            type="submit"
            disabled={!step2Form.formState.isValid || isSubmitting}
            className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '次に進む'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}; 