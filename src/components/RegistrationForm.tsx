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
  preferred_body_type: z.enum([
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
  preferred_body_type: z.enum([
    'クール',
    'カジュアル',
    'ビジネス',
    '気にしない'
  ]),
});

// レストラン選択のスキーマを更新
const restaurantPreferenceSchema = z.object({
  restaurant_preference: z.array(z.enum([
    '安旨居酒屋',
    'おしゃれダイニング'
  ])).min(1, '1つ以上選択してください'),
  agree_to_split: z.boolean().refine((val) => val === true, {
    message: '同意が必要です',
  }),
  preferred_1areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
  preferred_2areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
  preferred_3areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
});

// MBTIの組み合わせを定義
const mbtiOptions = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

// 定数の追加
const prefectures = [
  '北海道', '青森県', '岩手県', /* ... 他の都道府県 ... */ '沖縄県'
] as const;

const educationOptions = [
  '大学卒',
  '海外大学卒',
  '短大/専門学校卒',
  '高校卒'
] as const;

const incomeRanges = [
  '300万円未満',
  '300-500万円',
  '500-700万円',
  '700-1000万円',
  '1000万円以上'
] as const;

const occupations = [
  '会社員',
  '公務員',
  '経営者・役員',
  '自営業',
  '専門職',
  '教職',
  'パート・アルバイト',
  'その他'
] as const;

// プロフィールのスキーマを更新
const profileSchema = z.object({
  personality: z.array(z.enum([
    '明るい盛り上げタイプ',
    '気遣いできるタイプ',
    '天然いじられタイプ',
    'クールなタイプ'
  ])).min(1, '1つ以上選択してください'),
  mbti: z.enum(mbtiOptions, {
    required_error: 'MBTIを選択してください',
  }),
  appearance: z.enum([
    'ノリの良い体育会系',
    'こなれた港区系',
    'クールなエリート系',
    '個性あふれるクリエイティブ系'
  ]),
  style: z.enum([
    '筋肉質',
    'がっしり',
    'スリム',
    '普通'
  ]),
  dating_experience: z.number().min(0).max(10),
  study: z.enum(educationOptions),
  from: z.enum(prefectures),
  birthday: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, '正しい日付形式で入力してください'),
  occupation: z.enum(occupations),
  prefecture: z.enum(prefectures),
  city: z.string().min(1, '市区町村を選択してください'),
  income: z.enum(incomeRanges),
  mail: z.string().email('正しいメールアドレスを入力してください'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type MenPreferenceData = z.infer<typeof menPreferenceSchema>;
type WomenPreferenceData = z.infer<typeof womenPreferenceSchema>;
type RestaurantPreferenceData = z.infer<typeof restaurantPreferenceSchema>;
type ProfileData = z.infer<typeof profileSchema>;

type FormDataType = Step1Data & { party_type?: 'fun' | 'serious' };

type RegistrationFormProps = {
  userId: string;
};

const areaOptions = ['恵比寿', '新橋・銀座', 'どちらでもOK'] as const;

// フォームの型定義を追加
type RestaurantFormValues = {
  restaurant_preference: string[];
  agree_to_split: boolean;
  preferred_1areas: (typeof areaOptions)[number];
  preferred_2areas: (typeof areaOptions)[number];
  preferred_3areas: (typeof areaOptions)[number];
};

const personalityOptions = [
  '明るい盛り上げタイプ',
  '気遣いできるタイプ',
  '天然いじられタイプ',
  'クールなタイプ'
] as const;

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
      preferred_body_type: '気にしない',
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
      preferred_body_type: '気にしない',
    },
  });

  // レストラン選択フォームの追加
  const restaurantForm = useForm<RestaurantPreferenceData>({
    resolver: zodResolver(restaurantPreferenceSchema),
    mode: 'onChange',
    defaultValues: {
      restaurant_preference: [],
      agree_to_split: false,
      preferred_1areas: undefined,
      preferred_2areas: undefined,
      preferred_3areas: undefined,
    },
  });

  // プロフィールフォームの追加
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      personality: [],
      mbti: undefined,
      appearance: undefined,
      style: undefined,
      dating_experience: 0,
      study: undefined,
      from: undefined,
      birthday: '',
      occupation: undefined,
      prefecture: undefined,
      city: '',
      income: undefined,
      mail: '',
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
      // 既存のプロフィールを確認
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('line_id', userId)
        .single();

      // プロフィールの更新
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingProfile?.id || crypto.randomUUID(),
          line_id: userId,
          gender: formData.gender,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (profileError) throw profileError;

      // 選択した性別に応じてpreferencesテーブルを選択
      const preferencesTable = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      
      // 既存のpreferencesを確認
      const { data: existingPref } = await supabase
        .from(preferencesTable)
        .select('id')
        .eq('line_id', userId)
        .single();

      // 好みの更新
      const { error: prefError } = await supabase
        .from(preferencesTable)
        .upsert({
          id: existingPref?.id || crypto.randomUUID(),
          line_id: userId,
          party_type: data.party_type,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (prefError) throw prefError;

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
      // 既存のレコードを確認
      const { data: existingPref } = await supabase
        .from('men_preferences')
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error } = await supabase
        .from('men_preferences')
        .upsert({
          id: existingPref?.id || crypto.randomUUID(),
          line_id: userId,
          party_type: formData.party_type,
          preferred_age_min: data.preferred_age_min,
          preferred_age_max: data.preferred_age_max,
          preferred_personality: data.preferred_personality,
          preferred_body_type: [data.preferred_body_type],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
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
      // 既存のレコードを確認
      const { data: existingPref } = await supabase
        .from('women_preferences')
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error } = await supabase
        .from('women_preferences')
        .upsert({
          id: existingPref?.id || crypto.randomUUID(),
          line_id: userId,
          party_type: formData.party_type,
          preferred_age_min: data.preferred_age_min,
          preferred_age_max: data.preferred_age_max,
          preferred_personality: data.preferred_personality,
          preferred_body_type: [data.preferred_body_type],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
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
      
      const { data: existingPref } = await supabase
        .from(table)
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error } = await supabase
        .from(table)
        .upsert({
          id: existingPref?.id || crypto.randomUUID(),
          line_id: userId,
          restaurant_preference: data.restaurant_preference,
          preferred_1areas: data.preferred_1areas,
          preferred_2areas: data.preferred_2areas,
          preferred_3areas: data.preferred_3areas,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (error) throw error;
      setStep(5);
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

  // プロフィール送信ハンドラーの追加
  const handleProfileSubmit = async (data: ProfileData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          line_id: userId,
          personality: data.personality,
          mbti: data.mbti,
          appearance: data.appearance,
          style: data.style,
          dating_experience: data.dating_experience,
          study: data.study,
          from: data.from,
          birthday: data.birthday,
          occupation: data.occupation,
          prefecture: data.prefecture,
          city: data.city,
          income: data.income,
          mail: data.mail,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (error) throw error;
      setStep(6);
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
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
                      ${menPreferenceForm.watch('preferred_body_type') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...menPreferenceForm.register('preferred_body_type')}
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
                      ${womenPreferenceForm.watch('preferred_body_type') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...womenPreferenceForm.register('preferred_body_type')}
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

            {formData?.gender === 'men' && (
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...restaurantForm.register('agree_to_split')}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary/20"
                  />
                </div>
                <label className="ml-2 text-sm text-gray-600">
                  女性の飲食代はペア男性と負担してください。
                </label>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開催エリアを希望順に選んでください
              </label>
              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div key={order}>
                    <label className="block text-sm text-gray-600 mb-1">
                      第{order}希望
                    </label>
                    <select
                      {...restaurantForm.register(`preferred_${order}areas` as keyof RestaurantFormValues)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">選択してください</option>
                      {areaOptions.map((area) => (
                        <option key={area} value={area}
                          disabled={
                            restaurantForm.watch('preferred_1areas') === area ||
                            restaurantForm.watch('preferred_2areas') === area ||
                            restaurantForm.watch('preferred_3areas') === area
                          }
                        >
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
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

  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">プロフィールを入力しましょう</h2>
            <p className="text-sm text-gray-600 mt-2">あなたのことを教えてください</p>
          </div>
          
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自分の性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {personalityOptions.map((value) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${profileForm.watch('personality')?.includes(value as typeof personalityOptions[number])
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      {...profileForm.register('personality')}
                      className="sr-only"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MBTI
              </label>
              <select
                {...profileForm.register('mbti')}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">選択してください</option>
                {mbtiOptions.map((mbti) => (
                  <option key={mbti} value={mbti}>
                    {mbti}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                あえて自分の雰囲気を選ぶなら
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'ノリの良い体育会系',
                  'こなれた港区系',
                  'クールなエリート系',
                  '個性あふれるクリエイティブ系'
                ].map((value) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${profileForm.watch('appearance') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...profileForm.register('appearance')}
                      className="sr-only"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自分のスタイル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  '筋肉質',
                  'がっしり',
                  'スリム',
                  '普通'
                ].map((value) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${profileForm.watch('style') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...profileForm.register('style')}
                      className="sr-only"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合コンの経験回数は？（非公開）
              </label>
              <input
                type="number"
                {...profileForm.register('dating_experience', { valueAsNumber: true })}
                min="0"
                max="10"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学歴
              </label>
              <select
                {...profileForm.register('study')}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">選択してください</option>
                {educationOptions.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生年月日
              </label>
              <input
                type="text"
                placeholder="2001/05/20"
                {...profileForm.register('birthday')}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!profileForm.formState.isValid || isSubmitting}
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