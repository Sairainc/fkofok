import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { findMatch } from '@/lib/matching';

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
  preferred_age_min: z.number({ required_error: '最小年齢を選択してください' }).min(18).max(60),
  preferred_age_max: z.number({ required_error: '最大年齢を選択してください' }).min(18).max(60),
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
  ], {
    required_error: 'スタイルを選択してください'
  }),
});

// Step 3のスキーマ（女性用）
const womenPreferenceSchema = z.object({
  preferred_age_min: z.number({ required_error: '最小年齢を選択してください' }).min(20).max(60),
  preferred_age_max: z.number({ required_error: '最大年齢を選択してください' }).min(20).max(60),
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
  ], {
    required_error: 'スタイルを選択してください'
  }),
});

// レストラン選択のスキーマ
const restaurantPreferenceSchema = z.object({
  restaurant_preference: z.array(z.enum([
    '安旨居酒屋',
    'おしゃれダイニング'
  ])).min(1, '1つ以上選択してください'),
  agree_to_split: z.boolean().refine((val) => val === true, {
    message: '同意が必要です',
  }),
  preferred_1areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK'], {
    required_error: 'エリアを選択してください'
  }),
  preferred_2areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK'], {
    required_error: 'エリアを選択してください'
  }),
  preferred_3areas: z.enum(['恵比寿', '新橋・銀座', 'どちらでもOK'], {
    required_error: 'エリアを選択してください'
  }),
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

// プロフィール1のスキーマ
const profile1Schema = z.object({
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
});

// プロフィール2のスキーマを修正
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

// 写真アップロードのスキーマ
const photoSchema = z.object({
  photo: z.custom<File>((file) => file instanceof File, {
    message: '写真を選択してください'
  })
});

// 日程選択のスキーマ
const availabilitySchema = z.object({
  datetime: z.string({
    required_error: '日時を選択してください'
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type MenPreferenceData = z.infer<typeof menPreferenceSchema>;
type WomenPreferenceData = z.infer<typeof womenPreferenceSchema>;
type RestaurantPreferenceData = z.infer<typeof restaurantPreferenceSchema>;
type Profile1Data = z.infer<typeof profile1Schema>;
type Profile2Data = z.infer<typeof profile2Schema>;
type PhotoData = z.infer<typeof photoSchema>;

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

// 男性用と女性用の性格タイプを別々に定義
type MenPersonalityType = typeof menPreferenceSchema.shape.preferred_personality.element._def.values[number];
type WomenPersonalityType = typeof womenPreferenceSchema.shape.preferred_personality.element._def.values[number];

// 戻るボタンのコンポーネントを作成
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
  const [isSubmitted, _setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormDataType | null>(null);
  const [profile1Data, setProfile1Data] = useState<Profile1Data | null>(null);
  const [dateOptions, setDateOptions] = useState<Array<{
    value: string;
    label: string;
    isPopular: boolean;
  }>>([]);
  const _router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // maxStepsを使用していないため、_maxStepsにリネーム
  const _maxSteps = 9;

  useEffect(() => {
    if (step === 9) {
      const fetchDates = async () => {
        const options = await generateDateOptions();
        setDateOptions(options);
      };
      fetchDates();
    }
  }, [step]);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!userId) return;
      try {
        // プロフィールデータの取得
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            gender, 
            phone_number,
            party_type,
            personality,
            mbti,
            appearance,
            style,
            dating_experience,
            study,
            occupation,
            income,
            mail
          `)
          .eq('line_id', userId)
          .single();

        if (error) throw error;

        // 写真の存在確認
        const { data: photoData } = await supabase
          .from('user_photos')
          .select('photo_url')
          .eq('line_id', userId)
          .single();

        // 性別に応じた preferences テーブルのチェック
        const preferencesTable = profile?.gender === 'men' ? 'men_preferences' : 'women_preferences';
        const { data: preferences } = await supabase
          .from(preferencesTable)
          .select('*')
          .eq('line_id', userId)
          .single();
        
        // すべての必須フィールドが存在するかチェック
        const isFullyRegistered = profile && 
          profile.gender &&
          profile.phone_number &&
          profile.party_type &&
          profile.personality &&
          profile.mbti &&
          profile.appearance &&
          profile.style &&
          profile.dating_experience !== null &&
          profile.study &&
          profile.occupation &&
          profile.income &&
          profile.mail &&
          photoData?.photo_url &&
          preferences?.preferred_age_min &&  // preferences のチェックを追加
          preferences?.preferred_age_max &&
          preferences?.preferred_personality &&
          preferences?.preferred_body_type &&
          preferences?.datetime;  // 日時選択も必須

        setIsRegistered(!!isFullyRegistered);

        // 登録が途中の場合、適切なステップに移動
        if (profile && !isFullyRegistered) {
          if (!profile.gender || !profile.phone_number) {
            setStep(1);
          } else if (!profile.party_type) {
            setStep(2);
          } else if (!preferences?.preferred_age_min) {
            setStep(3);  // preferences が未登録の場合
          } else if (!profile.personality || !profile.mbti) {
            setStep(4);
          } else if (!photoData?.photo_url) {
            setStep(7);
          } else if (!profile.study || !profile.occupation || !profile.income || !profile.mail) {
            setStep(8);
          } else if (!preferences?.datetime) {
            setStep(9);  // 日時未選択の場合
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'No rows found') {
          console.error('Error checking registration status:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkRegistrationStatus();
  }, [userId]);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  const profile1Form = useForm<Profile1Data>({
    resolver: zodResolver(profile1Schema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (formData) {
      step1Form.reset(formData);
      if (formData.party_type) {
        step2Form.reset({ party_type: formData.party_type });
      }
    }
    if (profile1Data) {
      profile1Form.reset(profile1Data);
    }
  }, [formData, profile1Data]);

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

  // 写真アップロードフォームの追加
  const _photoForm = useForm<PhotoData>({
    resolver: zodResolver(photoSchema),
    mode: 'onChange',
  });

  // 日程選択フォームの追加
  const availabilityForm = useForm({
    resolver: zodResolver(availabilitySchema),
  });

  // フォームの状態を監視するuseEffect
  useEffect(() => {
    console.log('Profile2 Form State:', {
      isValid: profile2Form.formState.isValid,
      errors: profile2Form.formState.errors,
      dirtyFields: profile2Form.formState.dirtyFields,
      touchedFields: profile2Form.formState.touchedFields,
      values: profile2Form.getValues(),
    });
  }, [profile2Form.formState, profile2Form]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">マッチング待ち</h2>
            <p className="text-gray-600 mt-2">
              ご登録ありがとうございます。<br />
              マッチングをお待ちください。
            </p>
            <p className="text-sm text-primary mt-4">
              ※マッチングが成立しましたら、<br />
              合コンの詳細をLINEでお知らせいたします。
            </p>
            <p className="text-xs text-gray-500 mt-6">
              マッチングまでしばらくお待ちください。<br />
              通常1〜2日程度でマッチングが成立します。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">登録完了しました</h2>
            <p className="text-gray-600 mt-2">
              ご登録ありがとうございます。<br />
              マッチングが成立次第、LINEにてご連絡いたします。
            </p>
            <p className="text-sm text-primary mt-4">
              ※マッチングが成立しましたら、<br />
              合コンの詳細をLINEでお知らせいたします。
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAvailabilitySubmit = async (data: { datetime: string }) => {
    setIsSubmitting(true);
    try {
      const gender = formData?.gender;
      if (!gender) throw new Error('性別が不明です');

      const jstDate = new Date(data.datetime);
      const jstTimestamp = jstDate.toISOString().slice(0, 19).replace('T', ' ');

      const table = gender === 'men' ? 'men_preferences' : 'women_preferences';
      const { error } = await supabase
        .from(table)
        .upsert({
          line_id: userId,
          datetime: jstTimestamp,
          count: 1,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (error) throw error;
      setStep(10);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleStep1Submit = async (data: Step1Data) => {
    setFormData(data);
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!formData) return;
    try {
      setIsSubmitting(true);
      setFormData({
        ...formData,
        party_type: data.party_type
      });
      setStep(prevStep => prevStep + 1);
    } catch (error) {
      console.error('Error submitting step 2:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 共通の送信ハンドラー
  const handlePreferenceSubmit = async (data: MenPreferenceData | WomenPreferenceData) => {
    if (!formData || !userId) return;
    setIsSubmitting(true);
  
    try {
      // 1️⃣ `preferred_personality` を配列として確実に処理
      const formattedPersonality = Array.isArray(data.preferred_personality)
        ? `{${data.preferred_personality.map((p) => `"${p}"`).join(",")}}`
        : `{${data.preferred_personality}}`;
  
      // 2️⃣ `preferred_body_type` も同様に配列変換
      const formattedBodyType = Array.isArray(data.preferred_body_type)
        ? `{${data.preferred_body_type.map((b) => `"${b}"`).join(",")}}`
        : `{${data.preferred_body_type}}`;
  
      console.log("🚀 送信データ:", {
        line_id: userId,
        preferred_age_min: data.preferred_age_min,
        preferred_age_max: data.preferred_age_max,
        preferred_personality: formattedPersonality,
        preferred_body_type: formattedBodyType,
        party_type: formData.party_type,
      });
  
      // 3️⃣ 性別に応じたテーブルを選択
      const preferencesTable = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
  
      const { error } = await supabase
        .from(preferencesTable)
        .upsert({
          line_id: userId,
          preferred_age_min: data.preferred_age_min,
          preferred_age_max: data.preferred_age_max,
          preferred_personality: formattedPersonality,
          preferred_body_type: formattedBodyType,
          party_type: formData.party_type,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });
  
      if (error) throw error;
      setStep(4);
    } catch (error) {
      console.error("❌ エラー:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 既存のハンドラーを共通ハンドラーに置き換え
  const handleMenPreferenceSubmit = handlePreferenceSubmit;
  const handleWomenPreferenceSubmit = handlePreferenceSubmit;

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

  // プロフィール1の送信ハンドラ
  const handleProfile1Submit = async (data: Profile1Data) => {
    setProfile1Data(data);
    setStep(step + 1);
  };

  // プロフィール2の送信ハンドラ
  const handleProfile2Submit = async (data: Profile2Data) => {
    if (!profile1Data) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          line_id: userId,
          ...profile1Data,
          ...data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'line_id'
        });

      if (error) throw error;
      setStep(step + 1);
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 写真アップロードの送信ハンドラーを修正
  const handlePhotoSubmit = async (data: PhotoData) => {
    if (!userId || !data.photo) return;
    setIsSubmitting(true);

    try {
      const fileExt = data.photo.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, data.photo, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          photo_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('line_id', userId);

      if (updateError) throw updateError;
      setStep(prevStep => prevStep + 1);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('写真のアップロードに失敗しました。もう一度お試しください。');
    }
  };

  // コンポーネント内で日付オプションを生成する関数を追加
  const generateDateOptions = async () => {
    const dates = [];
    const today = new Date();
    
    // 来週の月曜日を取得
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()));
    
    // 来週の金曜日を取得
    const nextFriday = new Date(nextMonday);
    while (nextFriday.getDay() !== 5) {
      nextFriday.setDate(nextFriday.getDate() + 1);
    }

    // 来週から4週間分の金土を生成
    for (let week = 0; week < 4; week++) {
      // 金曜日を追加
      const friday = new Date(nextFriday);
      friday.setDate(friday.getDate() + (week * 7));
      const fridayISO = friday.toISOString();

      // 予約数を取得して人気判定
      const { data: fridayCount } = await supabase
        .from('availability')
        .select('count')
        .eq('datetime', fridayISO)
        .single();

      dates.push({
        value: fridayISO,
        label: `${friday.getMonth() + 1}月${friday.getDate()}日 (金) 19:00~`,
        isPopular: (fridayCount?.count ?? 0) > 3
      });

      // 土曜日を追加
      const saturday = new Date(friday);
      saturday.setDate(saturday.getDate() + 1);
      const saturdayISO = saturday.toISOString();

      const { data: saturdayCount } = await supabase
        .from('availability')
        .select('count')
        .eq('datetime', saturdayISO)
        .single();

      dates.push({
        value: saturdayISO,
        label: `${saturday.getMonth() + 1}月${saturday.getDate()}日 (土) 19:00~`,
        isPopular: (saturdayCount?.count ?? 0) > 3
      });
    }

    return dates;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">登録完了しました</h2>
            <p className="text-gray-600 mt-2">
              ご登録ありがとうございます。<br />
              マッチングが成立次第、LINEにてご連絡いたします。
            </p>
            <p className="text-sm text-primary mt-4">
              ※マッチングが成立しましたら、<br />
              合コンの詳細をLINEでお知らせいたします。
            </p>
          </div>
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

            <div className="space-y-3">
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
              {step > 1 && <BackButton onClick={() => setStep(step - 1)} />}
            </div>
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
                      ${menPreferenceForm.watch('preferred_personality')?.includes(value as MenPersonalityType)
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

            <div className="space-y-3">
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
              <BackButton onClick={() => setStep(step - 1)} />
            </div>
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
                      ${womenPreferenceForm.watch('preferred_personality')?.includes(value as WomenPersonalityType)
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

            <div className="space-y-3">
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
              <BackButton onClick={() => setStep(step - 1)} />
            </div>
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

            <div className="space-y-3">
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
              <BackButton onClick={() => setStep(step - 1)} />
            </div>
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
            <h2 className="text-xl font-bold text-gray-900">プロフィール入力 1/2</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの性格や特徴を教えてください</p>
          </div>
          
          <form onSubmit={profile1Form.handleSubmit(handleProfile1Submit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自分の性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {personalityOptions.map((value) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${profile1Form.watch('personality')?.includes(value as typeof personalityOptions[number])
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      {...profile1Form.register('personality')}
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
                {...profile1Form.register('mbti')}
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
                      ${profile1Form.watch('appearance') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...profile1Form.register('appearance')}
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
                      ${profile1Form.watch('style') === value
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...profile1Form.register('style')}
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
                {...profile1Form.register('dating_experience', { valueAsNumber: true })}
                min="0"
                max="10"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!profile1Form.formState.isValid || isSubmitting}
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

  if (step === 6) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">プロフィール入力 2/2</h2>
            <p className="text-sm text-gray-600 mt-2">基本情報を入力してください</p>
          </div>
          
          <form onSubmit={profile2Form.handleSubmit(handleProfile2Submit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生年月日*
              </label>
              <input
                type="text"
                placeholder="1990/01/01"
                {...profile2Form.register('birth_date')}
                className={`w-full p-2 border rounded-lg ${
                  profile2Form.formState.errors.birth_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {profile2Form.formState.errors.birth_date && (
                <p className="text-red-500 text-sm mt-1">
                  {profile2Form.formState.errors.birth_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学歴*
              </label>
              <select
                {...profile2Form.register('study')}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">選択してください</option>
                {educationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出身地
              </label>
              <select
                {...profile2Form.register('from')}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">選択してください</option>
                {prefectures.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お住まい
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  {...profile2Form.register('prefecture')}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">都道府県</option>
                  {prefectures.map((pref) => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="市区町村"
                  {...profile2Form.register('city')}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                収入
              </label>
              <select
                {...profile2Form.register('income')}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">選択してください</option>
                {incomeRanges.map((income) => (
                  <option key={income} value={income}>{income}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                {...profile2Form.register('mail')}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                職業*
              </label>
              <select
                {...profile2Form.register('occupation')}
                className={`w-full p-2 border rounded-lg ${
                  profile2Form.formState.errors.occupation ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                {occupations.map((occupation) => (
                  <option key={occupation} value={occupation}>{occupation}</option>
                ))}
              </select>
              {profile2Form.formState.errors.occupation && (
                <p className="text-red-500 text-sm mt-1">
                  {profile2Form.formState.errors.occupation.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!profile2Form.formState.isValid || isSubmitting}
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

  if (step === 7) {
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
                  {...step2Form.register('party_type', { required: true })}
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
                  {...step2Form.register('party_type', { required: true })}
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
  }

  if (step === 8) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">空いている日を教えて下さい</h2>
            <p className="text-sm text-gray-600 mt-2">1つ選択してください</p>
            <p className="text-primary font-medium mt-4">今だけ初回無料合コンをプレゼント！</p>
          </div>
          
          <form onSubmit={availabilityForm.handleSubmit(handleAvailabilitySubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {dateOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all
                    ${availabilityForm.formState.errors.datetime ? 'border-red-500' : 'border-gray-300'}
                    ${availabilityForm.watch('datetime') === option.value ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...availabilityForm.register('datetime', { required: '日時を選択してください' })}
                      className="sr-only"
                    />
                    <span>{option.label}</span>
                    {option.isPopular && (
                      <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                        人気
                      </span>
                    )}
                  </label>
                ))}
              {availabilityForm.formState.errors.datetime && (
                <p className="text-red-500 text-sm mt-1">
                  {availabilityForm.formState.errors.datetime.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!availabilityForm.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                '登録'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 9) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">登録完了しました</h2>
            <p className="text-gray-600 mt-2">
              ご登録ありがとうございます。<br />
              マッチングが成立次第、LINEにてご連絡いたします。
            </p>
            <p className="text-sm text-primary mt-4">
              ※マッチングが成立しましたら、<br />
              合コンの詳細をLINEでお知らせいたします。
            </p>
          </div>
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
                {...step2Form.register('party_type', { required: true })}
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
                {...step2Form.register('party_type', { required: true })}
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