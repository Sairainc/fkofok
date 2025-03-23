import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  preferred_age_min: z.number().min(20).max(60),
  preferred_age_max: z.number().min(20).max(60),
  preferred_personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
        '小悪魔',
      ])
    )
    .min(1, '1つ以上選択してください'),
  preferred_body_type: z.enum(['スリム', '普通', 'グラマー', '気にしない']),
});

// Step3 (女性用好み)
const womenPreferenceSchema = z.object({
  preferred_age_min: z.number().min(20).max(60),
  preferred_age_max: z.number().min(20).max(60),
  preferred_personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
      ])
    )
    .min(1, '1つ以上選択してください'),
  preferred_body_type: z.enum(['筋肉質', '普通', 'スリム', '気にしない']),
});

// Step4 (レストラン選択)
const restaurantPreferenceSchema = z.object({
  restaurant_preference: z
    .array(z.enum(['安旨居酒屋', 'おしゃれダイニング']))
    .min(1, '1つ以上選択してください'),

  agree_to_split: z.boolean(),

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

// ★Step5 (男性プロフィール1)
const menProfile1Schema = z.object({
  personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
      ])
    )
    .min(1, '1つ以上選択してください'),
  mbti: z.enum(mbtiOptions, {
    required_error: 'MBTIを選択してください',
  }),
  appearance: z.enum([
    'ノリの良い体育会系',
    'こなれた港区系',
    'クールなエリート系',
    '個性あふれるクリエイティブ系',
  ]),
  style: z.enum(['筋肉質', 'がっしり', 'スリム', '普通']),
  dating_experience: z.number().min(0).max(10),
});

// ★Step5 (女性プロフィール1)
const womenProfile1Schema = z.object({
  personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
        '小悪魔'
      ])
    )
    .min(1, '1つ以上選択してください'),
  mbti: z.enum(mbtiOptions, {
    required_error: 'MBTIを選択してください',
  }),
  appearance: z.enum([
    'ノリの良い元気系',
    '華やかなキラキラ系',
    '知的で落ち着いたキャリア系',
    '個性的でアーティスティック系',
  ]),
  style: z.enum(['グラマー', '普通', 'スリム']),
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
type RestaurantPreferenceData = z.infer<typeof restaurantPreferenceSchema>;
type MenProfile1Data = z.infer<typeof menProfile1Schema>;
type WomenProfile1Data = z.infer<typeof womenProfile1Schema>;
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
 *  追加: リテラル配列を as const
 * ----------------------------- */
const menPersonalityValues = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ',
  '小悪魔'
] as const;

const womenPersonalityValues = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ'
] as const;

// プロフィール1 で使う
const menProfile1Options = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ'
] as const;

const womenProfile1Options = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ'
] as const; // 必要に応じて変えてください

/* -----------------------------------
 *   メインの RegistrationForm コンポーネント
 * ----------------------------------- */
export const RegistrationForm = ({ userId }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType | null>(null);

  // menProfile1Data or womenProfile1Data を別々に管理
  const [menProfile1Data, setMenProfile1Data] = useState<MenProfile1Data | null>(null);
  const [womenProfile1Data, setWomenProfile1Data] = useState<WomenProfile1Data | null>(null);

  const [dateOptions, setDateOptions] = useState<
    Array<{
      value: string;
      label: string;
      isPopular: boolean;
    }>
  >([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 未使用変数エラー回避
  const [_profileGender, setProfileGender] = useState<'men' | 'women' | null>(null);

  useEffect(() => {
    if (step === 9) {
      const fetchDates = async () => {
        const options = await generateDateOptions();
        setDateOptions(options);
      };
      fetchDates();
    }
  }, [step]);

  // 登録済みチェック (プロフィール + 日付)
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!userId) return;
      try {
        // まずmatchesテーブルをチェック - DBに登録されているmatchesに含まれているかどうか
        console.log("📊 マッチテーブルをチェック - ユーザーID:", userId);
        
        let isInMatch = false;
        
        // male_user_1_id チェック
        const { data: matchData1, error: matchError1 } = await supabase
          .from('matches')
          .select('*')
          .eq('male_user_1_id', userId)
          .limit(1);
          
        if (matchError1) {
          console.error("❌ male_user_1_id検索エラー:", matchError1);
        } else if (matchData1 && matchData1.length > 0) {
          console.log("✅ male_user_1_idでマッチが見つかりました:", matchData1);
          isInMatch = true;
        }
        
        // male_user_2_id チェック
        if (!isInMatch) {
          const { data: matchData2, error: matchError2 } = await supabase
            .from('matches')
            .select('*')
            .eq('male_user_2_id', userId)
            .limit(1);
            
          if (matchError2) {
            console.error("❌ male_user_2_id検索エラー:", matchError2);
          } else if (matchData2 && matchData2.length > 0) {
            console.log("✅ male_user_2_idでマッチが見つかりました:", matchData2);
            isInMatch = true;
          }
        }
        
        // female_user_1_id チェック
        if (!isInMatch) {
          const { data: matchData3, error: matchError3 } = await supabase
            .from('matches')
            .select('*')
            .eq('female_user_1_id', userId)
            .limit(1);
            
          if (matchError3) {
            console.error("❌ female_user_1_id検索エラー:", matchError3);
          } else if (matchData3 && matchData3.length > 0) {
            console.log("✅ female_user_1_idでマッチが見つかりました:", matchData3);
            isInMatch = true;
          }
        }
        
        // female_user_2_id チェック
        if (!isInMatch) {
          const { data: matchData4, error: matchError4 } = await supabase
            .from('matches')
            .select('*')
            .eq('female_user_2_id', userId)
            .limit(1);
            
          if (matchError4) {
            console.error("❌ female_user_2_id検索エラー:", matchError4);
          } else if (matchData4 && matchData4.length > 0) {
            console.log("✅ female_user_2_idでマッチが見つかりました:", matchData4);
            isInMatch = true;
          }
        }

        // マッチが見つかった場合は/matchページにリダイレクト
        if (isInMatch) {
          console.log("🎯 マッチが見つかりました！マッチページにリダイレクトします");
          window.location.href = '/match';
          return;
        }

        // 以下は既存の処理
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('line_id', userId)
          .single();

        if (!profile?.gender || !profile?.phone_number) {
          setIsRegistered(false);
          setIsLoading(false);
          return;
        }

        setProfileGender(profile.gender);
        if (profile.gender === 'men') {
          const { data: menData } = await supabase
            .from('men_preferences')
            .select('datetime')
            .eq('line_id', userId)
            .single();

          if (menData?.datetime) {
            setIsRegistered(true);
          } else {
            setIsRegistered(false);
          }
        } else {
          const { data: womenData } = await supabase
            .from('women_preferences')
            .select('datetime')
            .eq('line_id', userId)
            .single();

          if (womenData?.datetime) {
            setIsRegistered(true);
          } else {
            setIsRegistered(false);
          }
        }
      } catch (error) {
        console.error('ステータスチェックエラー:', error);
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkRegistrationStatus();
  }, [userId]);

  // フォーム
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: formStateStep1,
    watch: watchStep1,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: formStateStep2,
    watch: watchStep2,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  const menPreferenceForm = useForm<MenPreferenceData>({
    resolver: zodResolver(menPreferenceSchema),
    mode: 'onChange',
    defaultValues: {
      preferred_age_min: 20,
      preferred_age_max: 30,
      preferred_personality: [],
      preferred_body_type: '気にしない',
    },
  });

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

  // ★男性プロフィール1用
  const menProfile1FormHook = useForm<MenProfile1Data>({
    resolver: zodResolver(menProfile1Schema),
    mode: 'onChange',
    defaultValues: {
      personality: [],
      mbti: undefined,
      appearance: undefined,
      style: undefined,
      dating_experience: 0,
    },
  });

  // ★女性プロフィール1用
  const womenProfile1FormHook = useForm<WomenProfile1Data>({
    resolver: zodResolver(womenProfile1Schema),
    mode: 'onChange',
    defaultValues: {
      personality: [],
      mbti: undefined,
      appearance: undefined,
      style: undefined,
      dating_experience: 0,
    },
  });

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
    },
  });

  const photoForm = useForm<PhotoData>({
    resolver: zodResolver(photoSchema),
    mode: 'onChange',
  });

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

  // すでにプロフィール & 日付が登録済み
  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

  /* ---------------------------------------------------
   *   ステップごとの送信ハンドラー
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
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: existingProfile?.id || crypto.randomUUID(),
            line_id: userId,
            gender: formData.gender,
            phone_number: formData.phone_number,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (profileError) throw profileError;

      const prefTable = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      const { data: existingPref } = await supabase
        .from(prefTable)
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error: prefError } = await supabase
        .from(prefTable)
        .upsert(
          {
            id: existingPref?.id || crypto.randomUUID(),
            line_id: userId,
            party_type: data.party_type,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (prefError) throw prefError;

      setFormData({ ...formData, party_type: data.party_type });
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
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
        .upsert(
          {
            id: existingPref?.id || crypto.randomUUID(),
            line_id: userId,
            party_type: formData.party_type,
            preferred_age_min: data.preferred_age_min,
            preferred_age_max: data.preferred_age_max,
            preferred_personality: data.preferred_personality,
            preferred_body_type: [data.preferred_body_type],
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (error) throw error;

      setStep(4);
    } catch (_) {
      alert('エラーが発生しました');
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
        .upsert(
          {
            id: existingPref?.id || crypto.randomUUID(),
            line_id: userId,
            party_type: formData.party_type,
            preferred_age_min: data.preferred_age_min,
            preferred_age_max: data.preferred_age_max,
            preferred_personality: data.preferred_personality,
            preferred_body_type: [data.preferred_body_type],
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (error) throw error;

      setStep(4);
    } catch (_) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step4: レストラン選択
  type PreferredAreaKeys = 'preferred_1areas' | 'preferred_2areas' | 'preferred_3areas';

  const handleRestaurantSubmitFn = async (data: RestaurantPreferenceData) => {
    if (!formData) return;
    setIsSubmitting(true);

    if (formData.gender === 'men' && !data.agree_to_split) {
      alert('女性の飲食代を男性が負担することに同意してください。');
      setIsSubmitting(false);
      return;
    }

    try {
      const table = formData.gender === 'men' ? 'men_preferences' : 'women_preferences';
      const { data: existingPref } = await supabase
        .from(table)
        .select('id')
        .eq('line_id', userId)
        .single();

      const { error } = await supabase
        .from(table)
        .upsert(
          {
            id: existingPref?.id || crypto.randomUUID(),
            line_id: userId,
            restaurant_preference: data.restaurant_preference,
            preferred_1areas: data.preferred_1areas,
            preferred_2areas: data.preferred_2areas,
            preferred_3areas: data.preferred_3areas,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (error) throw error;

      setStep(5);
    } catch (_) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ★Step5: 男性プロフィール1
  const handleMenProfile1Submit = (data: MenProfile1Data) => {
    // menProfile1Data を state に保存して次へ
    setMenProfile1Data(data);
    setStep(6);
  };

  // ★Step5: 女性プロフィール1
  const handleWomenProfile1Submit = (data: WomenProfile1Data) => {
    // womenProfile1Data を state に保存して次へ
    setWomenProfile1Data(data);
    setStep(6);
  };

  // Step6: プロフィール2
  const handleProfile2SubmitFn = async (data: Profile2Data) => {
    setIsSubmitting(true);
    try {
      // menProfile1Data もしくは womenProfile1Data のどちらかを利用
      let mergedProfile1 = {};

      if (formData?.gender === 'men' && menProfile1Data) {
        mergedProfile1 = { ...menProfile1Data };
      } else if (formData?.gender === 'women' && womenProfile1Data) {
        mergedProfile1 = { ...womenProfile1Data };
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            line_id: userId,
            ...mergedProfile1, // ここで menProfile1 / womenProfile1 の内容を反映
            ...data,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'line_id',
          }
        );
      if (error) throw error;

      setStep(7);
    } catch (_) {
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
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      if (!urlData || !urlData.publicUrl) {
        throw new Error('写真URLの取得に失敗しました');
      }

      // INSERT のみ (SELECTを呼ばず)
      const { error: insertError } = await supabase.from('user_photos').insert([
        {
          line_id: userId,
          photo_url: urlData.publicUrl,
          is_main: true,
          order_index: 0,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (insertError) throw insertError;

      setStep(9);
    } catch (err) {
      alert(err instanceof Error ? err.message : '写真のアップロードに失敗しました。');
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
          .upsert(
            {
              line_id: userId,
              datetime: jstTimestamp,
              count: 1,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'line_id',
            }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('women_preferences')
          .upsert(
            {
              line_id: userId,
              datetime: jstTimestamp,
              count: 1,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'line_id',
            }
          );
        if (error) throw error;
      }

      const matchResult = await findMatch(jstTimestamp);
      if (matchResult.success) {
        // ログは削除
      }

      setStep(10);
    } catch (_) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 日付オプション生成
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
      friday.setDate(friday.getDate() + week * 7);
      const fridayISO = friday.toISOString();

      const { data: fridayCount } = await supabase
        .from('availability')
        .select('count')
        .eq('datetime', fridayISO)
        .single();

      dates.push({
        value: fridayISO,
        label: `${friday.getMonth() + 1}月${friday.getDate()}日 (金) 19:00~`,
        isPopular: (fridayCount?.count ?? 0) > 3,
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
        isPopular: (saturdayCount?.count ?? 0) > 3,
      });
    }
    return dates;
  };

  /* --------------------------------------
   *   ここからステップごとの画面表示
   * -------------------------------------- */

  // Step1
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">基本情報の登録</h2>
            <p className="text-sm text-gray-600 mt-2">まずは基本的な情報を教えてください</p>
          </div>
          <form onSubmit={handleSubmitStep1(handleStep1Submit)} className="space-y-6">
            {/* 性別 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                あなたの性別*
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${formStateStep1.errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  style={{
                    backgroundColor:
                      watchStep1('gender') === 'men'
                        ? '#f84b91'
                        : '#fff',
                    color:
                      watchStep1('gender') === 'men'
                        ? '#fff'
                        : '#374151'
                  }}
                >
                  <input
                    type="radio"
                    value="men"
                    {...registerStep1('gender')}
                    className="sr-only"
                  />
                  男性
                </label>
                <label
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${formStateStep1.errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                  style={{
                    backgroundColor:
                      watchStep1('gender') === 'women'
                        ? '#f84b91'
                        : '#fff',
                    color:
                      watchStep1('gender') === 'women'
                        ? '#fff'
                        : '#374151'
                  }}
                >
                  <input
                    type="radio"
                    value="women"
                    {...registerStep1('gender')}
                    className="sr-only"
                  />
                  女性
                </label>
              </div>
            </div>
            {/* 電話番号 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                電話番号(非公開)*
              </label>
              <input
                type="tel"
                {...registerStep1('phone_number')}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${formStateStep1.errors.phone_number
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-primary/20'
                  }`}
              />
              {formStateStep1.errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {formStateStep1.errors.phone_number.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={!formStateStep1.isValid || isSubmitting}
                className="w-full p-3 bg-primary text-white rounded-lg font-medium disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
              >
                {isSubmitting
                  ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  : '次に進む'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step2: 合コンタイプ
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">希望する合コンタイプ</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの希望に合った合コンをご紹介します</p>
          </div>
          
          <form onSubmit={handleSubmitStep2(handleStep2SubmitFn)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                ${formStateStep2.errors.party_type ? 'border-red-500' : 'border-gray-300'}
                ${watchStep2('party_type') === 'fun' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="fun"
                  {...registerStep2('party_type')}
                  className="sr-only"
                />
                ワイワイノリ重視
              </label>
              <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                ${formStateStep2.errors.party_type ? 'border-red-500' : 'border-gray-300'}
                ${watchStep2('party_type') === 'serious' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>
                <input
                  type="radio"
                  value="serious"
                  {...registerStep2('party_type')}
                  className="sr-only"
                />
                真剣な恋愛
              </label>
            </div>

            <button
              type="submit"
              disabled={!formStateStep2.isValid || isSubmitting}
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

  // Step3: 男性用
  if (step === 3 && formData?.gender === 'men') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">好みのタイプ</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの理想の相手を教えてください</p>
          </div>
          
          <form onSubmit={menPreferenceForm.handleSubmit(handleMenPreferenceSubmit)} className="space-y-6">
            {/* 希望年齢 */}
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
                    {Array.from({ length: 43 }, (_, i) => i + 20).map((age) => (
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
                    {Array.from({ length: 43 }, (_, i) => i + 20).map((age) => (
                      <option key={age} value={age}>{age}歳</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 性格 (複数) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みの性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {menPersonalityValues.map((val) => (
                  <label
                    key={val}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${menPreferenceForm.watch('preferred_personality')?.includes(val)
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={val}
                      {...menPreferenceForm.register('preferred_personality')}
                      className="sr-only"
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            {/* スタイル (ラジオ) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みのスタイル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['スリム','普通','グラマー','気にしない'].map((value) => (
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
                    {value}
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

  // Step3: 女性用
  if (step === 3 && formData?.gender === 'women') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">好みのタイプ</h2>
            <p className="text-sm text-gray-600 mt-2">あなたの理想の相手を教えてください</p>
          </div>
          
          <form onSubmit={womenPreferenceForm.handleSubmit(handleWomenPreferenceSubmitFn)} className="space-y-6">
            {/* 希望年齢 */}
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

            {/* 性格 (複数) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みの性格（複数選択可）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {womenPersonalityValues.map((val) => (
                  <label
                    key={val}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                      ${womenPreferenceForm.watch('preferred_personality')?.includes(val)
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700'}`}
                  >
                    <input
                      type="checkbox"
                      value={val}
                      {...womenPreferenceForm.register('preferred_personality')}
                      className="sr-only"
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            {/* スタイル (ラジオ) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                好みのスタイル
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['筋肉質', '普通', 'スリム', '気にしない'].map((value) => (
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
                    {value}
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

  // Step4: レストラン選択
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">どんな合コンにしたい？</h2>
            <p className="text-sm text-gray-600 mt-2">お店の希望を教えてください</p>
          </div>
          
          <form onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmitFn)} className="space-y-6">
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

            {/* 性別が男性の場合は「女性の飲食代負担に同意」チェックを表示 */}
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
                  女性の飲食代はペア男性で負担することに同意します。
                </label>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開催エリアを希望順に選んでください
              </label>
              <div className="space-y-4">
                {[1, 2, 3].map((order) => {
                  const fieldName = `preferred_${order}areas` as PreferredAreaKeys;
                  return (
                    <div key={order}>
                      <label className="block text-sm text-gray-600 mb-1">
                        第{order}希望
                      </label>
                      <select
                        {...restaurantForm.register(fieldName)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">選択してください</option>
                        {areaOptions.map((area) => (
                          <option
                            key={area}
                            value={area}
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
                  );
                })}
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

  // Step5: プロフィール1
  if (step === 5) {
    // 性別で分岐
    if (formData?.gender === 'men') {
      // 男性用プロフィール1
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">プロフィール入力 (男性)</h2>
              <p className="text-sm text-gray-600 mt-2">
                あなたの性格や特徴を教えてください
              </p>
            </div>

            <form
              onSubmit={menProfile1FormHook.handleSubmit(handleMenProfile1Submit)}
              className="space-y-6"
            >
              {/* 性格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自分の性格（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {menProfile1Options.map((value) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        menProfile1FormHook
                          .watch('personality')
                          ?.includes(value)
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={value}
                        {...menProfile1FormHook.register('personality')}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* MBTI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MBTI
                </label>
                <select
                  {...menProfile1FormHook.register('mbti')}
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

              {/* 雰囲気 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  あえて自分の雰囲気を選ぶなら
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    'ノリの良い体育会系',
                    'こなれた港区系',
                    'クールなエリート系',
                    '個性あふれるクリエイティブ系',
                  ].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        menProfile1FormHook.watch('appearance') === val
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...menProfile1FormHook.register('appearance')}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {/* スタイル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自分のスタイル
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['筋肉質', 'がっしり', 'スリム', '普通'].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        menProfile1FormHook.watch('style') === val
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...menProfile1FormHook.register('style')}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {/* 合コン経験回数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合コンの経験回数は？（非公開）
                </label>
                <input
                  type="number"
                  {...menProfile1FormHook.register('dating_experience', {
                    valueAsNumber: true,
                  })}
                  min="0"
                  max="10"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={!menProfile1FormHook.formState.isValid || isSubmitting}
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
    } else {
      // 女性用プロフィール1
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">プロフィール入力 (女性)</h2>
              <p className="text-sm text-gray-600 mt-2">
                あなたの性格や特徴を教えてください
              </p>
            </div>

            <form
              onSubmit={womenProfile1FormHook.handleSubmit(handleWomenProfile1Submit)}
              className="space-y-6"
            >
              {/* 性格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自分の性格（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {womenProfile1Options.map((value) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        womenProfile1FormHook
                          .watch('personality')
                          ?.includes(value)
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={value}
                        {...womenProfile1FormHook.register('personality')}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* MBTI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MBTI
                </label>
                <select
                  {...womenProfile1FormHook.register('mbti')}
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

              {/* 雰囲気 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  あえて自分の雰囲気を選ぶなら
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    'ノリの良い元気系',
                    '華やかなキラキラ系',
                    '知的で落ち着いたキャリア系',
                    '個性的でアーティスティック系',
                  ].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        womenProfile1FormHook.watch('appearance') === val
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...womenProfile1FormHook.register('appearance')}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {/* スタイル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自分のスタイル
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['スリム', '普通', 'グラマー'].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                        womenProfile1FormHook.watch('style') === val
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...womenProfile1FormHook.register('style')}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>

              {/* 合コン経験回数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合コンの経験回数は？（非公開）
                </label>
                <input
                  type="number"
                  {...womenProfile1FormHook.register('dating_experience', {
                    valueAsNumber: true,
                  })}
                  min="0"
                  max="10"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={!womenProfile1FormHook.formState.isValid || isSubmitting}
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
  }

  // Step6: プロフィール2
  if (step === 6) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">プロフィール入力 2/2</h2>
            <p className="text-sm text-gray-600 mt-2">基本情報を入力してください</p>
          </div>
          
          <form onSubmit={profile2Form.handleSubmit(handleProfile2SubmitFn)} className="space-y-6">
            {/* 生年月日 */}
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

            {/* 学歴 */}
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
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* 出身地 */}
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
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            {/* お住まい */}
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
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
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

            {/* 収入 */}
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
                  <option key={income} value={income}>
                    {income}
                  </option>
                ))}
              </select>
            </div>

            {/* メール */}
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

            {/* 職業 */}
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
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
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

  // Step7: 写真アップロード
  if (step === 7) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">審査用写真の提出</h2>
            <p className="text-sm text-gray-600 mt-2">
              一切公開されません。<br />
              ※マスクや過度な加工の写真は審査ができません。
            </p>
          </div>
          
          <form onSubmit={photoForm.handleSubmit(handlePhotoSubmitFn)} className="space-y-6">
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                {...photoForm.register('photo')}
                className="w-full"
              />
              {photoForm.formState.errors.photo && (
                <p className="text-red-500 text-sm">
                  {photoForm.formState.errors.photo.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!photoForm.formState.isValid || isSubmitting}
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

  // Step9: 日程選択
  if (step === 9) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">空いている日を教えて下さい</h2>
            <p className="text-sm text-gray-600 mt-2">1つ選択してください</p>
            <p className="text-primary font-medium mt-4">今だけ初回無料合コンをプレゼント！</p>
          </div>
          
          <form onSubmit={availabilityForm.handleSubmit(handleAvailabilitySubmitFn)} className="space-y-6">
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
                    {...availabilityForm.register('datetime')}
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

  // Step10: 登録完了
  if (step === 10) {
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

  // フォールバック (万が一)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500">ロード中...</p>
    </div>
  );
};
