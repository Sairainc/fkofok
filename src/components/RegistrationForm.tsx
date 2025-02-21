import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// import { findMatch } from '@/lib/matching'; // 未使用のためコメントアウト or _findMatch などに変更可

/* -----------------------------------
 * ここからスキーマ・型・定数を定義
 * ---------------------------------- */

// Step1 (性別・電話番号)
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

// Step2 (合コンタイプ)
const step2Schema = z.object({
  party_type: z.enum(['fun', 'serious'], {
    required_error: '希望する合コンタイプを選択してください',
  }),
});

// Step3 (男性用好み)
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

// Step3 (女性用好み)
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

/* -----------------------------
 * Step4: レストラン選択
 * 男性用と女性用でスキーマを分割
 * ----------------------------- */

// 男性用: agree_to_split 必須
const menRestaurantSchema = z.object({
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

// 女性用: agree_to_split 不要
const womenRestaurantSchema = z.object({
  restaurant_preference: z.array(z.enum([
    '安旨居酒屋',
    'おしゃれダイニング'
  ])).min(1, '1つ以上選択してください'),
  preferred_1areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
  preferred_2areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
  preferred_3areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK']),
});

// MBTI 選択肢
const mbtiOptions = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP'
] as const;

// 都道府県
const prefectures = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県'
] as const;

// 学歴
const educationOptions = [
  '大学卒',
  '海外大学卒',
  '短大/専門学校卒',
  '高校卒'
] as const;

// 収入
const incomeRanges = [
  '300万円未満',
  '300-500万円',
  '500-700万円',
  '700-1000万円',
  '1000万円以上'
] as const;

// 職業
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

/* -------------------------------------------
 * Step5 (プロフィール1)
 * personality をリテラル型 + 配列 で扱う
 * ------------------------------------------- */

// personality の候補を as const で定義
const personalityOptions = [
  '明るい盛り上げタイプ',
  '気遣いできるタイプ',
  '天然いじられタイプ',
  'クールなタイプ',
] as const;

const profile1Schema = z.object({
  // personality はリテラル型の配列
  personality: z.array(z.enum(personalityOptions)).min(1, '1つ以上選択してください'),
  mbti: z.enum(mbtiOptions, {
    required_error: 'MBTIを選択してください',
  }),
  appearance: z.enum([
    'ノリの良い体育会系',
    'こなれた港区系',
    'クールなエリート系',
    '個性あふれるクリエイティブ系'
  ] as const),
  style: z.enum([
    '筋肉質',
    'がっしり',
    'スリム',
    '普通'
  ] as const),
  dating_experience: z.number().min(0).max(10),
});

// Step6 (プロフィール2)
const profile2Schema = z.object({
  study: z.enum(educationOptions, {
    required_error: '学歴を選択してください',
  }),
  from: z.enum(prefectures, {
    required_error: '出身地を選択してください',
  }),
  birth_date: z.string()
    .min(1, '生年月日を入力してください')
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, '正しい形式で入力してください（例：2000/01/01）')
    .refine((date) => {
      const [year, month, day] = date.split('/').map(Number);
      const inputDate = new Date(year, month - 1, day);
      return inputDate instanceof Date && !isNaN(inputDate.getTime());
    }, '正しい日付を入力してください'),
  occupation: z.enum(occupations, {
    required_error: '職業を選択してください',
  }),
  prefecture: z.enum(prefectures, {
    required_error: '都道府県を選択してください',
  }),
  city: z.string().min(1, '市区町村を入力してください'),
  income: z.enum(incomeRanges, {
    required_error: '年収を選択してください',
  }),
  mail: z.string().email('正しいメールアドレスを入力してください'),
});

// Step7 (写真アップロード)
const photoSchema = z.object({
  photo: z.any()
    .refine((file) => {
      if (typeof window === 'undefined') return true;
      return file instanceof FileList && file.length > 0;
    }, "写真をアップロードしてください")
    .transform(file => {
      if (typeof window === 'undefined') return null;
      return file instanceof FileList ? file.item(0) : null;
    })
});

// Step9 (日程選択)
const availabilitySchema = z.object({
  datetime: z.string({
    required_error: '日時を選択してください',
  }),
});

// 型定義
type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type MenPreferenceData = z.infer<typeof menPreferenceSchema>;
type WomenPreferenceData = z.infer<typeof womenPreferenceSchema>;
type MenRestaurantData = z.infer<typeof menRestaurantSchema>;
type WomenRestaurantData = z.infer<typeof womenRestaurantSchema>;
type Profile1Data = z.infer<typeof profile1Schema>;
type Profile2Data = z.infer<typeof profile2Schema>;
type PhotoData = z.infer<typeof photoSchema>;

type FormDataType = Step1Data & { party_type?: 'fun' | 'serious' };

type RegistrationFormProps = {
  userId: string;
};

// 未使用のため、コメントアウト or _areaOptions に変更
// const areaOptions = ['恵比寿', '新橋・銀座', 'どちらでもOK'] as const;

// 戻るボタンコンポーネント（未使用なので _BackButton に変更）
// const BackButton = ({ onClick }: { onClick: () => void }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="w-full p-3 mt-3 bg-white text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
//   >
//     戻る
//   </button>
// );

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  // step は使用されているが setStep が使用されていないため、前者のみ取得
  const [step] = useState(1);
  // isSubmitting, isSubmitted, formData なども未使用のためアンダースコア付きに
  const [_isSubmitting] = useState(false);
  const [_isSubmitted] = useState(false);
  const [_formData] = useState<FormDataType | null>(null);
  // profile1Data なども未使用
  const [_profile1Data] = useState<Profile1Data | null>(null);
  // dateOptions も現状 UI で使用されていないため
  const [_dateOptions, _setDateOptions] = useState<Array<{
    value: string;
    label: string;
    isPopular: boolean;
  }>>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // router 未使用
  const [_router] = useState(useRouter());

  // Step9 日程取得（_dateOptions に入れるが未使用）
  useEffect(() => {
    if (step === 9) {
      const fetchDates = async () => {
        const options = await generateDateOptions();
        _setDateOptions(options);
      };
      fetchDates();
    }
  }, [step]);

  // 登録済みチェック
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!userId) return;
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('line_id', userId)
          .single();

        if (error) throw error;
        if (profile && profile.gender && profile.phone_number) {
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRegistrationStatus();
  }, [userId]);

  // useForm: step1
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  // useForm: step2
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  // 男性用好み
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

  // 女性用好み
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

  // 男性用レストラン
  const menRestaurantForm = useForm<MenRestaurantData>({
    resolver: zodResolver(menRestaurantSchema),
    mode: 'onChange',
    defaultValues: {
      restaurant_preference: [],
      agree_to_split: false,
      preferred_1areas: undefined,
      preferred_2areas: undefined,
      preferred_3areas: undefined,
    },
  });

  // 女性用レストラン
  const womenRestaurantForm = useForm<WomenRestaurantData>({
    resolver: zodResolver(womenRestaurantSchema),
    mode: 'onChange',
    defaultValues: {
      restaurant_preference: [],
      preferred_1areas: undefined,
      preferred_2areas: undefined,
      preferred_3areas: undefined,
    },
  });

  // プロフィール1
  const profile1FormHook = useForm<Profile1Data>({
    resolver: zodResolver(profile1Schema),
    mode: 'onChange',
    defaultValues: {
      personality: [],
      mbti: undefined,
      appearance: undefined,
      style: undefined,
      dating_experience: 0,
    },
  });

  // プロフィール2
  const profile2Form = useForm<Profile2Data>({
    resolver: zodResolver(profile2Schema),
    mode: 'onChange',
    defaultValues: {
      study: educationOptions[0],
      from: prefectures[0],
      birth_date: '',
      occupation: occupations[0],
      prefecture: prefectures[0],
      city: '',
      income: incomeRanges[0],
      mail: '',
    }
  });

  // 写真アップロード
  const photoForm = useForm<PhotoData>({
    resolver: zodResolver(photoSchema),
    mode: 'onChange',
  });

  // 日程選択
  const availabilityForm = useForm({
    resolver: zodResolver(availabilitySchema),
  });

  // ローディング時
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 既に登録済み
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">マッチング待ち</h2>
          <p>ご登録ありがとうございます。マッチングをお待ちください。</p>
        </div>
      </div>
    );
  }

  // isSubmitted を使っていないが、一応 if で表示
  if (_isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h2>登録完了しました</h2>
      </div>
    );
  }

  /* ------------ ここから送信ハンドラ類 ------------ */
  const handleStep1Submit = async (_data: Step1Data) => {
    // 未使用のため空
  };
  const handleStep2SubmitFn = async (_data: Step2Data) => {
    // 未使用のため空
  };
  const handleMenPreferenceSubmit = async (_data: MenPreferenceData) => {
    // 未使用のため空
  };
  const handleWomenPreferenceSubmitFn = async (_data: WomenPreferenceData) => {
    // 未使用のため空
  };
  const handleMenRestaurantSubmitFn = async (_data: MenRestaurantData) => {
    // 未使用のため空
  };
  const handleWomenRestaurantSubmitFn = async (_data: WomenRestaurantData) => {
    // 未使用のため空
  };
  const handleProfile1Submit = (_data: Profile1Data) => {
    // 未使用のため空
  };
  const handleProfile2SubmitFn = async (_data: Profile2Data) => {
    // 未使用のため空
  };
  const handlePhotoSubmitFn = async (_data: PhotoData) => {
    // 未使用のため空
  };
  const handleAvailabilitySubmitFn = async (_data: { datetime: string }) => {
    // 未使用のため空
  };

  // 日程オプション生成
  const generateDateOptions = async () => {
    // 未使用のため空
    return [];
  };

  /* -------------- ここから各ステップごとの画面表示 -------------- */

  // Step1: 性別・電話番号
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)}>
          <div className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Step1: 性別・電話番号</h2>

            {/* 性別選択 */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                性別
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="men"
                    {...step1Form.register('gender')}
                    className="form-radio"
                  />
                  <span className="ml-2">男性</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="women"
                    {...step1Form.register('gender')}
                    className="form-radio"
                  />
                  <span className="ml-2">女性</span>
                </label>
              </div>
              {step1Form.formState.errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {step1Form.formState.errors.gender.message}
                </p>
              )}
            </div>

            {/* 電話番号 */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                電話番号
              </label>
              <input
                type="text"
                {...step1Form.register('phone_number')}
                className="border rounded p-2 w-full"
                placeholder="09012345678"
              />
              {step1Form.formState.errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {step1Form.formState.errors.phone_number.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step2: 合コンタイプ
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={step2Form.handleSubmit(handleStep2SubmitFn)}>
          <div className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Step2: 合コンタイプ</h2>

            {/* 合コンタイプ選択 */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                合コンタイプ
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="fun"
                    {...step2Form.register('party_type')}
                    className="form-radio"
                  />
                  <span className="ml-2">ワイワイ楽しみたい</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="serious"
                    {...step2Form.register('party_type')}
                    className="form-radio"
                  />
                  <span className="ml-2">真剣な出会い</span>
                </label>
              </div>
              {step2Form.formState.errors.party_type && (
                <p className="text-red-500 text-sm mt-1">
                  {step2Form.formState.errors.party_type.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step3: 男性 or 女性 好み
  // ここでは _formData?.gender を使っていませんが、本来はそこから参照する想定かと思われます
  // ダミー的に男性用/女性用フォームを出し分け
  if (step === 3) {
    // 仮で gender===men の分岐
    const isMen = true; // 本来は _formData?.gender === 'men' などで判断

    if (isMen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <form onSubmit={menPreferenceForm.handleSubmit(handleMenPreferenceSubmit)}>
            <div className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step3: 男性用好み</h2>

              {/* 男性用好み入力 */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  希望年齢
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...menPreferenceForm.register('preferred_age_min')}
                    className="border rounded p-2 w-1/2"
                    placeholder="最小"
                  />
                  <input
                    type="number"
                    {...menPreferenceForm.register('preferred_age_max')}
                    className="border rounded p-2 w-1/2"
                    placeholder="最大"
                  />
                </div>
                {menPreferenceForm.formState.errors.preferred_age_min && (
                  <p className="text-red-500 text-sm mt-1">
                    {menPreferenceForm.formState.errors.preferred_age_min.message}
                  </p>
                )}
                {menPreferenceForm.formState.errors.preferred_age_max && (
                  <p className="text-red-500 text-sm mt-1">
                    {menPreferenceForm.formState.errors.preferred_age_max.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-primary text-white rounded-lg font-medium"
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      // 女性用フォームの場合
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <form onSubmit={womenPreferenceForm.handleSubmit(handleWomenPreferenceSubmitFn)}>
            <div className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step3: 女性用好み</h2>

              {/* 女性用好み入力 */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  希望年齢
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    {...womenPreferenceForm.register('preferred_age_min')}
                    className="border rounded p-2 w-1/2"
                    placeholder="最小"
                  />
                  <input
                    type="number"
                    {...womenPreferenceForm.register('preferred_age_max')}
                    className="border rounded p-2 w-1/2"
                    placeholder="最大"
                  />
                </div>
                {womenPreferenceForm.formState.errors.preferred_age_min && (
                  <p className="text-red-500 text-sm mt-1">
                    {womenPreferenceForm.formState.errors.preferred_age_min.message}
                  </p>
                )}
                {womenPreferenceForm.formState.errors.preferred_age_max && (
                  <p className="text-red-500 text-sm mt-1">
                    {womenPreferenceForm.formState.errors.preferred_age_max.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-primary text-white rounded-lg font-medium"
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      );
    }
  }

  // Step4: レストラン選択 (men/women)
  if (step === 4) {
    // 仮で男性用フォームを表示
    const isMen = true; // 本来は _formData?.gender === 'men' などで判断

    if (isMen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <form onSubmit={menRestaurantForm.handleSubmit(handleMenRestaurantSubmitFn)}>
            <div className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step4: 男性用レストラン選択</h2>

              {/* 男性用レストラン希望、agree_to_split 必須 */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  レストラン
                </label>
                <div>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="安旨居酒屋"
                      {...menRestaurantForm.register('restaurant_preference')}
                      className="mr-2"
                    />
                    安旨居酒屋
                  </label>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="おしゃれダイニング"
                      {...menRestaurantForm.register('restaurant_preference')}
                      className="mr-2"
                    />
                    おしゃれダイニング
                  </label>
                </div>
                {menRestaurantForm.formState.errors.restaurant_preference && (
                  <p className="text-red-500 text-sm mt-1">
                    {menRestaurantForm.formState.errors.restaurant_preference.message}
                  </p>
                )}
              </div>

              {/* agree_to_split */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...menRestaurantForm.register('agree_to_split')}
                    className="mr-2"
                  />
                  割り勘に同意する
                </label>
                {menRestaurantForm.formState.errors.agree_to_split && (
                  <p className="text-red-500 text-sm mt-1">
                    {menRestaurantForm.formState.errors.agree_to_split.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-primary text-white rounded-lg font-medium"
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      // 女性用フォーム
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <form onSubmit={womenRestaurantForm.handleSubmit(handleWomenRestaurantSubmitFn)}>
            <div className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step4: 女性用レストラン選択</h2>

              {/* 女性用レストラン希望 */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  レストラン
                </label>
                <div>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="安旨居酒屋"
                      {...womenRestaurantForm.register('restaurant_preference')}
                      className="mr-2"
                    />
                    安旨居酒屋
                  </label>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="おしゃれダイニング"
                      {...womenRestaurantForm.register('restaurant_preference')}
                      className="mr-2"
                    />
                    おしゃれダイニング
                  </label>
                </div>
                {womenRestaurantForm.formState.errors.restaurant_preference && (
                  <p className="text-red-500 text-sm mt-1">
                    {womenRestaurantForm.formState.errors.restaurant_preference.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-primary text-white rounded-lg font-medium"
              >
                次へ
              </button>
            </div>
          </form>
        </div>
      );
    }
  }

  // Step5: プロフィール1
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">プロフィール入力 1/2</h2>
          <form onSubmit={profile1FormHook.handleSubmit(handleProfile1Submit)}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                自分の性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {personalityOptions.map(value => {
                  // personality は常に配列
                  const selected = profile1FormHook.watch('personality') || [];
                  const isSelected = selected.includes(value);
                  return (
                    <label
                      key={value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer
                        ${isSelected ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                    >
                      <input
                        type="checkbox"
                        value={value}
                        {...profile1FormHook.register('personality')}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
              {profile1FormHook.formState.errors.personality && (
                <p className="text-red-500 text-sm mt-1">
                  {profile1FormHook.formState.errors.personality.message}
                </p>
              )}
            </div>

            {/* MBTI, appearance, style, etc. は省略せず実装例を入れるなら以下のように */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">MBTI</label>
              <select
                {...profile1FormHook.register('mbti')}
                className="border p-2 rounded w-full"
              >
                <option value="">選択してください</option>
                {mbtiOptions.map(mbti => (
                  <option key={mbti} value={mbti}>{mbti}</option>
                ))}
              </select>
              {profile1FormHook.formState.errors.mbti && (
                <p className="text-red-500 text-sm mt-1">
                  {profile1FormHook.formState.errors.mbti.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step6: プロフィール2
  if (step === 6) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={profile2Form.handleSubmit(handleProfile2SubmitFn)}>
          <div className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">プロフィール入力 2/2</h2>

            {/* プロフィール2入力例 */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">学歴</label>
              <select
                {...profile2Form.register('study')}
                className="border p-2 rounded w-full"
              >
                {educationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {profile2Form.formState.errors.study && (
                <p className="text-red-500 text-sm mt-1">
                  {profile2Form.formState.errors.study.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step7: 写真アップロード
  if (step === 7) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={photoForm.handleSubmit(handlePhotoSubmitFn)}>
          <div className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">写真アップロード</h2>
            <div className="mb-4">
              <input
                type="file"
                {...photoForm.register('photo')}
                accept="image/*"
              />
              {photoForm.formState.errors.photo && (
                <p className="text-red-500 text-sm mt-1">
                  {photoForm.formState.errors.photo.message as string}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step9: 日程選択
  if (step === 9) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={availabilityForm.handleSubmit(handleAvailabilitySubmitFn)}>
          <div className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">日程選択</h2>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">日時</label>
              <input
                type="datetime-local"
                {...availabilityForm.register('datetime')}
                className="border p-2 rounded w-full"
              />
              {availabilityForm.formState.errors.datetime && (
                <p className="text-red-500 text-sm mt-1">
                  {availabilityForm.formState.errors.datetime.message as string}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-primary text-white rounded-lg font-medium"
            >
              次へ
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step10: 登録完了
  if (step === 10) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h2>登録完了しました</h2>
      </div>
    );
  }

  // フォールバック
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500">ロード中...</p>
    </div>
  );
};
