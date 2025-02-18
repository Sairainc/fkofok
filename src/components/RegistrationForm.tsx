import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
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

type FormData = z.infer<typeof formSchema>;

type RegistrationFormProps = {
  userId: string;
};

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (!userId || !data.gender || !data.phone_number) {
        throw new Error('必須項目が入力されていません');
      }

      const today = new Date();
      const defaultBirthdate = new Date(today.getFullYear() - 20, 0, 1);
      const uuid = crypto.randomUUID();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: uuid,
          line_id: userId,
          gender: data.gender,
          user_type: data.gender,
          phone_number: data.phone_number,
          birthdate: defaultBirthdate.toISOString().split('T')[0],
          prefecture: '東京都',
          occupation: '会社員',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          personality: [],
          style: 'casual',
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error('データベースエラーが発生しました');
      }

      setIsSubmitted(true);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            登録が完了しました
          </h2>
          <p className="text-gray-600">
            基本情報の登録が完了しました。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
        </div>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              あなたの性別*
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                ${form.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                ${form.watch('gender') === 'men' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="men"
                  {...form.register('gender')}
                  className="sr-only"
                />
                男性
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                ${form.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                ${form.watch('gender') === 'women' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="women"
                  {...form.register('gender')}
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
              {...form.register('phone_number')}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                ${form.formState.errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
            />
          </div>

          <button
            type="submit"
            disabled={!form.formState.isValid || isSubmitting}
            className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500"
          >
            登録する
          </button>
        </form>
      </div>
    </div>
  );
}; 