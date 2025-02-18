import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const firstPageSchema = z.object({
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

const secondPageSchema = z.object({
  preference: z.enum(['fun', 'serious'], {
    required_error: '希望する合コンタイプを選択してください',
  }),
});

type FirstPageFormData = z.infer<typeof firstPageSchema>;
type SecondPageFormData = z.infer<typeof secondPageSchema>;

type RegistrationFormProps = {
  userId: string;
};

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userGender, setUserGender] = useState<'men' | 'women' | null>(null);

  const firstForm = useForm<FirstPageFormData>({
    resolver: zodResolver(firstPageSchema),
    mode: 'onChange',
  });

  const secondForm = useForm<SecondPageFormData>({
    resolver: zodResolver(secondPageSchema),
    mode: 'onChange',
  });

  const handleFirstPageSubmit = async (data: FirstPageFormData) => {
    setIsSubmitting(true);
    try {
      if (!userId || !data.gender || !data.phone_number) {
        throw new Error('必須項目が入力されていません');
      }

      // 現在の日付を取得
      const today = new Date();
      const defaultBirthdate = new Date(today.getFullYear() - 20, 0, 1);

      // UUIDv4を生成
      const uuid = crypto.randomUUID();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: uuid, // UUIDを使用
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
          preferred_areas: [],
          style: 'casual',
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error('データベースエラーが発生しました');
      }

      setUserGender(data.gender);
      setCurrentPage(2);
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

  const handleSecondPageSubmit = async (data: SecondPageFormData) => {
    setIsSubmitting(true);
    try {
      if (!userId || !userGender) {
        throw new Error('セッションエラーが発生しました');
      }

      const tableName = userGender === 'men' ? 'men_preferences' : 'women_preferences';
      const uuid = crypto.randomUUID();
      
      const { error } = await supabase
        .from(tableName)
        .upsert({
          id: uuid,
          line_id: userId,
          party_type: data.preference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          preferred_age_range: '20-30',
          preferred_personality: ['friendly'],
          preferred_style: ['casual'],
          restaurant_preference: 'casual',
          preferred_areas: ['東京']
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error('データベースエラーが発生しました');
      }

      window.location.href = '/prepare';
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

  if (currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
          </div>
          
          <form onSubmit={firstForm.handleSubmit(handleFirstPageSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                あなたの性別*
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${firstForm.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                  ${firstForm.watch('gender') === 'men' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                  <input
                    type="radio"
                    value="men"
                    {...firstForm.register('gender')}
                    className="sr-only"
                  />
                  男性
                </label>
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                  ${firstForm.formState.errors.gender ? 'border-red-500' : 'border-gray-300'}
                  ${firstForm.watch('gender') === 'women' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                  <input
                    type="radio"
                    value="women"
                    {...firstForm.register('gender')}
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
                {...firstForm.register('phone_number')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${firstForm.formState.errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/20'}`}
              />
            </div>

            <button
              type="submit"
              disabled={!firstForm.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500"
            >
              次へ進む
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
          <h2 className="text-xl font-bold text-gray-900">どんな合コンに行きたい？</h2>
        </div>
        
        <form onSubmit={secondForm.handleSubmit(handleSecondPageSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
              ${secondForm.formState.errors.preference ? 'border-red-500' : 'border-gray-300'}
              ${secondForm.watch('preference') === 'fun' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                value="fun"
                {...secondForm.register('preference')}
                className="sr-only"
              />
              ワイワイノリ重視
            </label>
            <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
              ${secondForm.formState.errors.preference ? 'border-red-500' : 'border-gray-300'}
              ${secondForm.watch('preference') === 'serious' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                value="serious"
                {...secondForm.register('preference')}
                className="sr-only"
              />
              真剣な恋愛
            </label>
          </div>

          <button
            type="submit"
            disabled={!secondForm.formState.isValid || isSubmitting}
            className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500"
          >
            次へ進む
          </button>
        </form>
      </div>
    </div>
  );
}; 