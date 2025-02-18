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

// Step 3のスキーマ（男性用）
const menPreferenceSchema = z.object({
  preferred_age_min: z.number().min(18).max(60),
  preferred_age_max: z.number().min(18).max(60),
  preferred_personality: z.array(z.enum([
    '明るい盛り上げタイプ',
    '気遣いできる',
    '天然',
    'クール',
    '小悪魔'
  ])).min(1, '1つ以上選択してください'),
  preferred_style: z.enum([
    'スリム',
    '普通',
    'グラマー',
    '気にしない'
  ]),
});

// Step 3のスキーマ（女性用）
const womenPreferenceSchema = z.object({
  preferred_age_min: z.number().min(20).max(60),
  preferred_age_max: z.number().min(20).max(60),
  preferred_personality: z.array(z.enum([
    '優しい',
    '向上心がある',
    '面白い',
    '知的',
    '紳士的'
  ])).min(1, '1つ以上選択してください'),
  preferred_style: z.enum([
    'クール',
    'カジュアル',
    'ビジネス',
    '気にしない'
  ]),
});

// レストラン選択のスキーマ
const restaurantPreferenceSchema = z.object({
  restaurant_preference: z.array(z.enum([
    '安旨居酒屋',
    'おしゃれダイニング'
  ])).min(1, '1つ以上選択してください'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type MenPreferenceData = z.infer<typeof menPreferenceSchema>;
type WomenPreferenceData = z.infer<typeof womenPreferenceSchema>;
type RestaurantPreferenceData = z.infer<typeof restaurantPreferenceSchema>;

type FormDataType = Step1Data & { party_type?: 'fun' | 'serious' };

type RegistrationFormProps = {
  userId: string;
};

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const router = useRouter();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  // 既存のフォーム定義に加えて、Step3のフォームを追加
  const menPreferenceForm = useForm<MenPreferenceData>({
    resolver: zodResolver(menPreferenceSchema),
    mode: 'onChange',
    defaultValues: {
      preferred_age_min: 18,
      preferred_age_max: 30,
      preferred_personality: [],
      preferred_style: '気にしない',
    },
  });

  // 女性用フォームの追加
  const womenPreferenceForm = useForm<WomenPreferenceData>({
    resolver: zodResolver(womenPreferenceSchema),
    mode: 'onChange',
    defaultValues: {
      preferred_age_min: 20,
      preferred_age_max: 35,
      preferred_personality: [],
      preferred_style: '気にしない',
    },
  });

  // レストラン選択フォームの追加
  const restaurantForm = useForm<RestaurantPreferenceData>({
    resolver: zodResolver(restaurantPreferenceSchema),
    mode: 'onChange',
    defaultValues: {
      restaurant_preference: [],
    },
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

      // formDataを更新
      setFormData({ ...formData, party_type: data.party_type });
      setStep(3);
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

  const handleMenPreferenceSubmit = async (data: MenPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('men_preferences')
        .upsert({
          line_id: userId,
          preferred_age_min: data.preferred_age_min,
          preferred_age_max: data.preferred_age_max,
          preferred_personality: data.preferred_personality,
          preferred_style: data.preferred_style,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setStep(4);
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

  // 女性用の送信ハンドラーを追加
  const handleWomenPreferenceSubmit = async (data: WomenPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('women_preferences')
        .upsert({
          line_id: userId,
          preferred_age_min: data.preferred_age_min,
          preferred_age_max: data.preferred_age_max,
          preferred_personality: data.preferred_personality,
          preferred_style: data.preferred_style,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

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

  // レストラン選択の送信ハンドラー
  const handleRestaurantSubmit = async (data: RestaurantPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      const table = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      const { error } = await supabase
        .from(table)
        .upsert({
          line_id: userId,
          restaurant_preference: data.restaurant_preference,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setStep(5); // 次のステップへ
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

  if (step === 3 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">好みのタイプ</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの理想の相手を教えてください</p>
          </div>
          
          <form onSubmit={menPreferenceForm.handleSubmit(handleMenPreferenceSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望年齢
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <select
                    {...menPreferenceForm.register('preferred_age_min', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                      <option key={age} value={age}>{age}歳</option>
                    ))}
                  </select>
                </div>
                <span>〜</span>
                <div className="flex-1">
                  <select
                    {...menPreferenceForm.register('preferred_age_max', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                      <option key={age} value={age}>{age}歳</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みの性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '明るい盛り上げタイプ', label: '明るい盛り上げタイプ' },
                  { value: '気遣いできる', label: '気遣いできる' },
                  { value: '天然', label: '天然' },
                  { value: 'クール', label: 'クール' },
                  { value: '小悪魔', label: '小悪魔' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${menPreferenceForm.watch('preferred_personality')?.includes(value as any)
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      {...menPreferenceForm.register('preferred_personality')}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みのスタイル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'スリム', label: 'スリム' },
                  { value: '普通', label: '普通' },
                  { value: 'グラマー', label: 'グラマー' },
                  { value: '気にしない', label: '気にしない' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${menPreferenceForm.watch('preferred_style') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...menPreferenceForm.register('preferred_style')}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!menPreferenceForm.formState.isValid || isSubmitting}
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

  if (step === 3 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">好みのタイプ</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの理想の相手を教えてください</p>
          </div>
          
          <form onSubmit={womenPreferenceForm.handleSubmit(handleWomenPreferenceSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                希望年齢
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <select
                    {...womenPreferenceForm.register('preferred_age_min', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 41 }, (_, i) => i + 20).map((age) => (
                      <option key={age} value={age}>{age}歳</option>
                    ))}
                  </select>
                </div>
                <span>〜</span>
                <div className="flex-1">
                  <select
                    {...womenPreferenceForm.register('preferred_age_max', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 41 }, (_, i) => i + 20).map((age) => (
                      <option key={age} value={age}>{age}歳</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みの性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '優しい', label: '優しい' },
                  { value: '向上心がある', label: '向上心がある' },
                  { value: '面白い', label: '面白い' },
                  { value: '知的', label: '知的' },
                  { value: '紳士的', label: '紳士的' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${womenPreferenceForm.watch('preferred_personality')?.includes(value as any)
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      {...womenPreferenceForm.register('preferred_personality')}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みのスタイル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'クール', label: 'クール' },
                  { value: 'カジュアル', label: 'カジュアル' },
                  { value: 'ビジネス', label: 'ビジネス' },
                  { value: '気にしない', label: '気にしない' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${womenPreferenceForm.watch('preferred_style') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...womenPreferenceForm.register('preferred_style')}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!womenPreferenceForm.formState.isValid || isSubmitting}
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

  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">どんな合コンにしたい？</h2>
            <p className="text-sm text-gray-600 mt-2">お店の希望を教えてください</p>
          </div>
          
          <form onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[
                { value: '安旨居酒屋' as const, label: '安旨居酒屋 ¥3,500~/人' },
                { value: 'おしゃれダイニング' as const, label: 'おしゃれダイニング ¥5,000~/人' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                    ${restaurantForm.watch('restaurant_preference')?.includes(value)
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700'}`}
                >
                  <input
                    type="checkbox"
                    value={value}
                    {...restaurantForm.register('restaurant_preference')}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={!restaurantForm.formState.isValid || isSubmitting}
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