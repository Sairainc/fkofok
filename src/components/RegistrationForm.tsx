import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findMatch } from '@/lib/matching';

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

const areaOptions = ['恵比寿', '新橋・銀座', 'どちらでもOK'] as const;

// 戻るボタンコンポーネント
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full p-3 mt-3 bg-white text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
  >
    戻る
  </button>
);

export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const [profile1Data, setProfile1Data] = useState<Profile1Data | null>(null);
  const [dateOptions, setDateOptions] = useState<Array<{
    value: string;
    label: string;
    isPopular: boolean;
  }>>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Step9 日程取得
  useEffect(() => {
    if (step === 9) {
      const fetchDates = async () => {
        const options = await generateDateOptions();
        setDateOptions(options);
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
    // personality を必ず配列
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

  // 登録完了
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h2>登録完了しました</h2>
      </div>
    );
  }

  /* ------------ ここから送信ハンドラ類 ------------ */
  const handleStep1Submit = async (data: Step1Data) => { /* ... */ };
  const handleStep2SubmitFn = async (data: Step2Data) => { /* ... */ };
  const handleMenPreferenceSubmit = async (data: MenPreferenceData) => { /* ... */ };
  const handleWomenPreferenceSubmitFn = async (data: WomenPreferenceData) => { /* ... */ };
  const handleMenRestaurantSubmitFn = async (data: MenRestaurantData) => { /* ... */ };
  const handleWomenRestaurantSubmitFn = async (data: WomenRestaurantData) => { /* ... */ };
  const handleProfile1Submit = (data: Profile1Data) => { /* ... */ };
  const handleProfile2SubmitFn = async (data: Profile2Data) => { /* ... */ };
  const handlePhotoSubmitFn = async (data: PhotoData) => { /* ... */ };
  const handleAvailabilitySubmitFn = async (data: { datetime: string }) => { /* ... */ };

  // 日程オプション生成
  const generateDateOptions = async () => {
    // ... 
    return [];
  };

  /* -------------- ここから各ステップごとの画面表示 -------------- */

  // Step1: 性別・電話番号
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)}>
          {/* 性別・電話番号入力 */}
        </form>
      </div>
    );
  }

  // Step2: 合コンタイプ
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={step2Form.handleSubmit(handleStep2SubmitFn)}>
          {/* 合コンタイプ */}
        </form>
      </div>
    );
  }

  // Step3: 男性 or 女性 好み
  if (step === 3 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={menPreferenceForm.handleSubmit(handleMenPreferenceSubmit)}>
          {/* 男性用好み入力 */}
        </form>
      </div>
    );
  }

  if (step === 3 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={womenPreferenceForm.handleSubmit(handleWomenPreferenceSubmitFn)}>
          {/* 女性用好み入力 */}
        </form>
      </div>
    );
  }

  // Step4: レストラン選択 (men/women)
  if (step === 4 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={menRestaurantForm.handleSubmit(handleMenRestaurantSubmitFn)}>
          {/* 男性用レストラン希望、agree_to_split 必須 */}
        </form>
      </div>
    );
  }
  if (step === 4 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={womenRestaurantForm.handleSubmit(handleWomenRestaurantSubmitFn)}>
          {/* 女性用レストラン希望 */}
        </form>
      </div>
    );
  }

  // Step5: プロフィール1
  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-gray-900">プロフィール入力 1/2</h2>
          <form onSubmit={profile1FormHook.handleSubmit(handleProfile1Submit)}>
            <div>
              <label>自分の性格（複数選択可）</label>
              <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* MBTI, appearance, style, etc. */}

            <button
              type="submit"
              disabled={!profile1FormHook.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500"
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
          {/* プロフィール2入力 */}
        </form>
      </div>
    );
  }

  // Step7: 写真アップロード
  if (step === 7) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={photoForm.handleSubmit(handlePhotoSubmitFn)}>
          {/* 写真アップロード */}
        </form>
      </div>
    );
  }

  // Step9: 日程選択
  if (step === 9) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={availabilityForm.handleSubmit(handleAvailabilitySubmitFn)}>
          {/* 日程選択 */}
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
