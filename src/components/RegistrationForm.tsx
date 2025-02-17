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
      
      // TODO: 次のステップへの遷移処理を実装
      console.log('Success!');
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">基本情報の登録</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                性別
              </label>
              <select
                {...register('gender')}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all
                  ${errors.gender ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
              >
                <option value="">選択してください</option>
                <option value="men">男性</option>
                <option value="women">女性</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-500 mt-1 animate-fadeIn">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                電話番号
              </label>
              <input
                type="tel"
                {...register('phone_number')}
                placeholder="例: 09012345678"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all
                  ${errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
              />
              {errors.phone_number && (
                <p className="text-sm text-red-500 mt-1 animate-fadeIn">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
                ${isValid && !isSubmitting 
                  ? 'bg-primary hover:bg-primary-dark' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                '次へ進む'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 