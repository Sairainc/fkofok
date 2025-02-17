import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const schema = z.object({
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

type FormData = z.infer<typeof schema>;

type RegistrationFormProps = {
  userId: string;
};

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          line_id: userId,
          gender: data.gender,
          phone_number: data.phone_number,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      window.location.href = '/prepare';
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="The4" className="h-12 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              あなたの性別*
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                ${errors.gender ? 'border-red-500' : 'border-gray-300'}
                ${watch('gender') === 'men' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="men"
                  {...register('gender')}
                  className="sr-only"
                />
                男性
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                ${errors.gender ? 'border-red-500' : 'border-gray-300'}
                ${watch('gender') === 'women' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="women"
                  {...register('gender')}
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
              {...register('phone_number')}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                ${errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full p-3 bg-gray-200 text-gray-800 rounded-lg font-medium"
          >
            次へ進む
          </button>
        </form>
      </div>
    </div>
  );
}; 