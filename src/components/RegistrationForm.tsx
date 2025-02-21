import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findMatch } from '@/lib/matching';

/* -----------------------------------
 * ここからスキーマ・型・定数を定義
 * ----------------------------------- */

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

// 男性用
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

// 女性用
const womenRestaurantSchema = z.object({
  restaurant_preference: z.array(z.enum([
    '安旨居酒屋',
    'おしゃれダイニング'
  ])).min(1, '1つ以上選択してください'),
  // 女性は agree_to_split 不要
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

// Step5 (プロフィール1)
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

// 男性用＆女性用のレストランスキーマ型
type MenRestaurantData = z.infer<typeof menRestaurantSchema>;
type WomenRestaurantData = z.infer<typeof womenRestaurantSchema>;

type Profile1Data = z.infer<typeof profile1Schema>;
type Profile2Data = z.infer<typeof profile2Schema>;
type PhotoData = z.infer<typeof photoSchema>;

// Step1 + party_type 用
type FormDataType = Step1Data & { party_type?: 'fun' | 'serious' };

type RegistrationFormProps = {
  userId: string;
};

// エリア
const areaOptions = ['恵比寿', '新橋・銀座', 'どちらでもOK'] as const;

// 戻るボタン
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full p-3 mt-3 bg-white text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
  >
    戻る
  </button>
);

/* -----------------------------
 *   メインの RegistrationForm コンポーネント
 * ----------------------------- */
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

  // 日程選択
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

  // --- useForm セットアップ ---

  // Step1: 性別・電話番号
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  // Step2: 合コンタイプ
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  // Step3: 男性用
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

  // Step3: 女性用
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

  // Step4: 男性用
  const menRestaurantForm = useForm<MenRestaurantData>({
    resolver: zodResolver(menRestaurantSchema),
    mode: 'onChange',
    defaultValues: {
      restaurant_preference: [],
      agree_to_split: false, // 男性はここが初期値 false
      preferred_1areas: undefined,
      preferred_2areas: undefined,
      preferred_3areas: undefined,
    },
  });

  // Step4: 女性用
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

  // Step5: プロフィール1
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

  // Step6: プロフィール2
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

  // Step7: 写真アップロード
  const photoForm = useForm<PhotoData>({
    resolver: zodResolver(photoSchema),
    mode: 'onChange',
  });

  // Step9: 日程選択
  const availabilityForm = useForm({
    resolver: zodResolver(availabilitySchema),
  });

  // ロード中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 登録済み
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
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
          </div>
        </div>
      </div>
    );
  }

  // 全完了
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7" 
                />
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

  /* ---------------------------------------------------
   *   ここからステップごとの送信ハンドラー (submit)
   * --------------------------------------------------- */

  // Step1
  const handleStep1Submit = async (data: Step1Data) => {
    setFormData(data);
    setStep(2);
  };

  // Step2
  const handleStep2SubmitFn = async (data: Step2Data) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
      // 既存の profiles レコード
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('line_id', userId)
        .single();

      // profiles テーブル upsert
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

      // men_preferences or women_preferences
      const prefTable = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      const { data: existingPref } = await supabase
        .from(prefTable)
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error: prefError } = await supabase
        .from(prefTable)
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
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step3: 男性用
  const handleMenPreferenceSubmit = async (data: MenPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
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
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step3: 女性用
  const handleWomenPreferenceSubmitFn = async (data: WomenPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
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

      // 女性もステップ4へ
      setStep(4);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step4: 男性用
  const handleMenRestaurantSubmitFn = async (data: MenRestaurantData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
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
          restaurant_preference: data.restaurant_preference,
          agree_to_split: data.agree_to_split,
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
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step4: 女性用
  const handleWomenRestaurantSubmitFn = async (data: WomenRestaurantData) => {
    if (!formData) return;
    setIsSubmitting(true);

    try {
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
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step5: プロフィール1
  const handleProfile1Submit = (data: Profile1Data) => {
    setProfile1Data(data);
    setStep(6);
  };

  // Step6: プロフィール2
  const handleProfile2SubmitFn = async (data: Profile2Data) => {
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

      setStep(7);
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step7: 写真アップロード
  const handlePhotoSubmitFn = async (data: PhotoData) => {
    setIsSubmitting(true);

    try {
      if (!data.photo || !(data.photo instanceof File)) {
        throw new Error('写真が選択されていません');
      }

      const fileExt = data.photo.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, data.photo, {
          cacheControl: '3600',
          upsert: true
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('写真URLの取得に失敗しました');
      }

      const { error: insertError } = await supabase
        .from('user_photos')
        .insert([{
          line_id: userId,
          photo_url: urlData.publicUrl,
          is_main: true,
          order_index: 0,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      if (insertError) throw insertError;

      setStep(9);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : '写真のアップロードに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step9: 日程選択
  const handleAvailabilitySubmitFn = async (data: { datetime: string }) => {
    setIsSubmitting(true);
    try {
      const gender = formData?.gender;
      if (!gender) throw new Error('性別が不明です');

      const jstDate = new Date(data.datetime);
      const jstTimestamp = jstDate.toISOString().slice(0, 19).replace('T', ' ');

      if (gender === 'men') {
        const { error } = await supabase
          .from('men_preferences')
          .upsert({
            line_id: userId,
            datetime: jstTimestamp,
            count: 1,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'line_id'
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('women_preferences')
          .upsert({
            line_id: userId,
            datetime: jstTimestamp,
            count: 1,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'line_id'
          });
        if (error) throw error;
      }

      const matchResult = await findMatch(jstTimestamp);
      if (matchResult.success) {
        console.log('マッチング成功:', matchResult.match);
      }

      setStep(10);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 日付オプション生成（Step9）
  const generateDateOptions = async () => {
    const dates = [];
    const today = new Date();

    // 来週の月曜日
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()));

    // 来週の金曜日
    const nextFriday = new Date(nextMonday);
    while (nextFriday.getDay() !== 5) {
      nextFriday.setDate(nextFriday.getDate() + 1);
    }

    // 4週分の金土
    for (let week = 0; week < 4; week++) {
      const friday = new Date(nextFriday);
      friday.setDate(friday.getDate() + (week * 7));
      const fridayISO = friday.toISOString();

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

  /* --------------------------------------
   *   ここからステップごとの画面表示
   * -------------------------------------- */

  // Step1: 性別・電話番号
  if (step === 1) {
    // ...省略: 前と同様
    // 省略せずに書くなら上記のフォーマットで
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
            <p className="text-sm text-gray-600 mt-2">まずは基本的な情報を教えてください</p>
          </div>
          
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
            {/* 性別 */}
            {/* ... */}
            {/* 電話番号 */}
            {/* ... */}

            <button
              type="submit"
              disabled={!step1Form.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
            >
              次に進む
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step2: 合コンタイプ
  if (step === 2) {
    // ...省略: 同様に step2Form
    return (
      <div>...</div>
    );
  }

  // Step3: 男性用
  if (step === 3 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {/* ... menPreferenceForm */}
        {/* handleMenPreferenceSubmit */}
      </div>
    );
  }

  // Step3: 女性用
  if (step === 3 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {/* ... womenPreferenceForm */}
        {/* handleWomenPreferenceSubmitFn */}
      </div>
    );
  }

  /* ---------------------------------------------------
   *  Step4: 男性用 or 女性用 の レストラン選択
   * --------------------------------------------------- */

  if (step === 4 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">どんな合コンにしたい？(男性)</h2>
            <p className="text-sm text-gray-600 mt-2">お店の希望を教えてください</p>
          </div>
          
          <form onSubmit={menRestaurantForm.handleSubmit(handleMenRestaurantSubmitFn)} className="space-y-6">
            {/* 複数選択: restaurant_preference */}
            {/* agree_to_split チェックボックス (男性用) */}
            {/* preferred_1areas / preferred_2areas / preferred_3areas */}
            {/* ...略 */}
            
            <button
              type="submit"
              disabled={!menRestaurantForm.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
            >
              {isSubmitting ? '処理中...' : '次に進む'}
            </button>
            <BackButton onClick={() => setStep(step - 1)} />
          </form>
        </div>
      </div>
    );
  }

  if (step === 4 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">どんな合コンにしたい？(女性)</h2>
            <p className="text-sm text-gray-600 mt-2">お店の希望を教えてください</p>
          </div>
          
          <form onSubmit={womenRestaurantForm.handleSubmit(handleWomenRestaurantSubmitFn)} className="space-y-6">
            {/* restaurant_preference */}
            {/* preferred_1areas / 2areas / 3areas */}
            {/* 女性では agree_to_split は表示しない */}
            
            <button
              type="submit"
              disabled={!womenRestaurantForm.formState.isValid || isSubmitting}
              className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
            >
              {isSubmitting ? '処理中...' : '次に進む'}
            </button>
            <BackButton onClick={() => setStep(step - 1)} />
          </form>
        </div>
      </div>
    );
  }

  // Step5: プロフィール入力1
  if (step === 5) {
    // ...
    return (
      <div>...</div>
    );
  }

  // Step6: プロフィール入力2
  if (step === 6) {
    // ...
    return (
      <div>...</div>
    );
  }

  // Step7: 写真アップロード
  if (step === 7) {
    // ...
    return (
      <div>...</div>
    );
  }

  // Step9: 日程選択
  if (step === 9) {
    // ...
    return (
      <div>...</div>
    );
  }

  // Step10: 登録完了
  if (step === 10) {
    // ...
    return (
      <div>...</div>
    );
  }

  // フォールバック
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500">ロード中...</p>
    </div>
  );
};
