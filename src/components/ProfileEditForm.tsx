// ProfileEditForm.jsx
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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

// MBTI 選択肢
const mbtiOptions = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP'
] as const;

// 男性用パーソナリティ選択肢
const menPersonalityOptions = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ',
];

// 女性用パーソナリティ選択肢
const womenPersonalityOptions = [
  '明るい盛り上げタイプ',
  '気遣いできる',
  '天然いじられタイプ',
  'クールなタイプ',
  '小悪魔'
];

// 男性用体型選択肢
const menStyleOptions = ['筋肉質', 'がっしり', 'スリム', '普通'];

// 女性用体型選択肢
const womenStyleOptions = ['グラマー', '普通', 'スリム'];

// 男性用外見選択肢
const menAppearanceOptions = [
  'ノリの良い体育会系',
  'こなれた港区系',
  'クールなエリート系',
  '個性あふれるクリエイティブ系',
];

// 女性用外見選択肢
const womenAppearanceOptions = [
  'ノリの良い元気系',
  '華やかなキラキラ系',
  '知的で落ち着いたキャリア系',
  '個性的でアーティスティック系',
];

// プロフィールスキーマを更新し、全てのフィールドを必須に変更
const profileSchema = z.object({
  gender: z.enum(['men', 'women']),
  phone_number: z
    .string()
    .min(10, '電話番号が短すぎます')
    .max(11, '電話番号が長すぎます')
    .regex(/^[0-9]+$/, '数字のみ入力してください'),
  personality: z.array(z.string()).min(1, '少なくとも1つ選択してください'),
  mbti: z.enum(mbtiOptions, {
    errorMap: () => ({ message: 'MBTIタイプを選択してください' })
  }),
  appearance: z.string().min(1, '外見タイプを選択してください'),
  style: z.string().min(1, '体型を選択してください'),
  dating_experience: z.string().min(1, '合コン経験を入力してください'),
  education: z.enum(educationOptions, {
    errorMap: () => ({ message: '学歴を選択してください' })
  }),
  hometown_prefecture: z.enum(prefectures, {
    errorMap: () => ({ message: '出身都道府県を選択してください' })
  }),
  hometown_city: z.string().min(1, '出身市区町村を入力してください'),
  prefecture: z.enum(prefectures, {
    errorMap: () => ({ message: '現在の都道府県を選択してください' })
  }),
  current_city: z.string().min(1, '現在の市区町村を入力してください'),
  birth_date: z.string()
    .min(1, '生年月日を入力してください')
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, '正しい形式で入力してください（例：2000/01/01）')
    .refine((date) => {
      if (!date) return false;
      const [year, month, day] = date.split('/').map(Number);
      const inputDate = new Date(year, month - 1, day);
      return inputDate instanceof Date && !isNaN(inputDate.getTime());
    }, '正しい日付を入力してください'),
  occupation: z.enum(occupations, {
    errorMap: () => ({ message: '職業を選択してください' })
  }),
  income: z.enum(incomeRanges, {
    errorMap: () => ({ message: '年収を選択してください' })
  }),
  email: z.string().email('正しいメールアドレスを入力してください'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileEditFormProps = {
  userId: string;
};

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [_originalData, setOriginalData] = useState<any>(null); // 元のデータを保存
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      personality: [],
    },
  });

  const personalityOptions = gender === 'men' ? menPersonalityOptions : womenPersonalityOptions;
  const styleOptions = gender === 'men' ? menStyleOptions : womenStyleOptions;
  const appearanceOptions = gender === 'men' ? menAppearanceOptions : womenAppearanceOptions;

  // ユーザープロフィールをロード
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('line_id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // 元のデータを保存
          setOriginalData(data);
          
          // 性別の設定（存在する場合のみ）
          if (data.gender) {
            setGender(data.gender);
            setValue('gender', data.gender);
          }
          
          // その他のフォーム値を設定
          setValue('phone_number', data.phone_number || '');
          setValue('personality', data.personality || []);
          setValue('mbti', data.mbti as any || '');
          setValue('appearance', data.appearance || '');
          setValue('style', data.style || '');
          setValue('dating_experience', data.dating_experience || '');
          setValue('education', data.study as any || '');
          setValue('hometown_prefecture', data.from as any || '');
          setValue('hometown_city', '');
          setValue('prefecture', data.prefecture as any || '');
          setValue('current_city', data.city || '');
          setValue('birth_date', data.birth_date?.replace(/-/g, '/') || '');
          setValue('occupation', data.occupation as any || '');
          setValue('income', data.income as any || '');
          setValue('email', data.mail || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true);

      // 実際のデータベース構造に合わせてマッピング
      const updatedData: Record<string, unknown> = { 
        gender: gender,
        updated_at: new Date().toISOString()
      };

      // 実際のDBのフィールドに合わせて設定
      if (data.phone_number) updatedData.phone_number = data.phone_number;
      if (data.birth_date) updatedData.birth_date = data.birth_date.replace(/\//g, '-');
      if (data.email) updatedData.mail = data.email; // mailフィールドに設定
      if (data.personality && data.personality.length > 0) updatedData.personality = data.personality;
      if (data.mbti) updatedData.mbti = data.mbti;
      if (data.appearance) updatedData.appearance = data.appearance;
      if (data.style) updatedData.style = data.style;
      if (data.dating_experience) updatedData.dating_experience = data.dating_experience;
      if (data.current_city) updatedData.city = data.current_city;
      if (data.prefecture) updatedData.prefecture = data.prefecture;
      if (data.occupation) updatedData.occupation = data.occupation;
      if (data.income) updatedData.income = data.income;
      if (data.education) updatedData.study = data.education; // studyフィールドに設定
      if (data.hometown_prefecture) updatedData.from = data.hometown_prefecture; // fromフィールドに設定
      // hometown_cityは保存先フィールドがないようです

      console.log('Updating profile with data:', updatedData);
      
      // データ更新処理
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('line_id', userId);

      if (error) throw error;

      setShowSuccessPopup(true);
      router.refresh();
    } catch (error) {
      console.error('プロフィールの更新中にエラーが発生しました:', error);
      setErrorMessage('プロフィールの更新中にエラーが発生しました。詳細はコンソールを確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-2 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">完了しました！</h3>
              <p className="text-gray-500 mb-6">プロフィールが正常に更新されました。</p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-2 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h3>
              <p className="text-gray-500 mb-6">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 基本情報セクション */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">基本情報</h3>
          
          {/* 性別フィールドを削除 - 表示しないが値は送信するための隠しフィールド */}
          <input type="hidden" {...register('gender')} value={gender} />
          
          {/* 電話番号 */}
          <div className="space-y-2">
            <label htmlFor="phone_number" className="block font-medium">
              電話番号
            </label>
            <input
              id="phone_number"
              type="text"
              {...register('phone_number')}
              className="w-full p-2 border rounded-md"
              placeholder="09012345678"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm">{errors.phone_number.message}</p>
            )}
          </div>
          
          {/* 生年月日 */}
          <div className="space-y-2">
            <label htmlFor="birth_date" className="block font-medium">
              生年月日
            </label>
            <input
              id="birth_date"
              type="text"
              {...register('birth_date')}
              className="w-full p-2 border rounded-md"
              placeholder="YYYY/MM/DD"
            />
            {errors.birth_date && (
              <p className="text-red-500 text-sm">{errors.birth_date.message}</p>
            )}
          </div>

          {/* メールアドレス */}
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full p-2 border rounded-md"
              placeholder="example@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* プロフィール情報セクション */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">プロフィール情報</h3>
          
          {/* パーソナリティ */}
          <div className="space-y-2">
            <label className="block font-medium">パーソナリティ（複数選択可）</label>
            <div className="grid grid-cols-2 gap-2">
              {personalityOptions.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    {...register('personality')}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.personality && (
              <p className="text-red-500 text-sm">{errors.personality.message}</p>
            )}
          </div>

          {/* MBTI */}
          <div className="space-y-2">
            <label htmlFor="mbti" className="block font-medium">
              MBTI
            </label>
            <select
              id="mbti"
              {...register('mbti')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {mbtiOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.mbti && (
              <p className="text-red-500 text-sm">{errors.mbti.message}</p>
            )}
          </div>

          {/* 外見 */}
          <div className="space-y-2">
            <label htmlFor="appearance" className="block font-medium">
              外見タイプ
            </label>
            <select
              id="appearance"
              {...register('appearance')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {appearanceOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.appearance && (
              <p className="text-red-500 text-sm">{errors.appearance.message}</p>
            )}
          </div>

          {/* 体型 */}
          <div className="space-y-2">
            <label htmlFor="style" className="block font-medium">
              体型
            </label>
            <select
              id="style"
              {...register('style')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {styleOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.style && (
              <p className="text-red-500 text-sm">{errors.style.message}</p>
            )}
          </div>

          {/* 交際経験 */}
          <div className="space-y-2">
            <label htmlFor="dating_experience" className="block font-medium">
              合コン経験
            </label>
            <input
              id="dating_experience"
              type="number"
              min="0"
              max="10"
              {...register('dating_experience')}
              className="w-full p-2 border rounded-md"
              placeholder="0"
            />
            {errors.dating_experience && (
              <p className="text-red-500 text-sm">{errors.dating_experience.message}</p>
            )}
          </div>
        </div>

        {/* 学歴・職業セクション */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">学歴・職業情報</h3>
          
          {/* 学歴 */}
          <div className="space-y-2">
            <label htmlFor="education" className="block font-medium">
              学歴
            </label>
            <select
              id="education"
              {...register('education')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {educationOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.education && (
              <p className="text-red-500 text-sm">{errors.education.message}</p>
            )}
          </div>

          {/* 職業 */}
          <div className="space-y-2">
            <label htmlFor="occupation" className="block font-medium">
              職業
            </label>
            <select
              id="occupation"
              {...register('occupation')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {occupations.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.occupation && (
              <p className="text-red-500 text-sm">{errors.occupation.message}</p>
            )}
          </div>

          {/* 年収 */}
          <div className="space-y-2">
            <label htmlFor="income" className="block font-medium">
              年収
            </label>
            <select
              id="income"
              {...register('income')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {incomeRanges.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.income && (
              <p className="text-red-500 text-sm">{errors.income.message}</p>
            )}
          </div>
        </div>

        {/* 住所情報セクション */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">住所情報</h3>
          
          {/* 出身地 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="hometown_prefecture" className="block font-medium">
                出身都道府県
              </label>
              <select
                id="hometown_prefecture"
                {...register('hometown_prefecture')}
                className="w-full p-2 border rounded-md"
              >
                <option value="">選択してください</option>
                {prefectures.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.hometown_prefecture && (
                <p className="text-red-500 text-sm">{errors.hometown_prefecture.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="hometown_city" className="block font-medium">
                出身市区町村
              </label>
              <input
                id="hometown_city"
                type="text"
                {...register('hometown_city')}
                className="w-full p-2 border rounded-md"
                placeholder="〇〇市"
              />
              {errors.hometown_city && (
                <p className="text-red-500 text-sm">{errors.hometown_city.message}</p>
              )}
            </div>
          </div>

          {/* 現住所 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="prefecture" className="block font-medium">
                現在の都道府県
              </label>
              <select
                id="prefecture"
                {...register('prefecture')}
                className="w-full p-2 border rounded-md"
              >
                <option value="">選択してください</option>
                {prefectures.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.prefecture && (
                <p className="text-red-500 text-sm">{errors.prefecture.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="current_city" className="block font-medium">
                現在の市区町村
              </label>
              <input
                id="current_city"
                type="text"
                {...register('current_city')}
                className="w-full p-2 border rounded-md"
                placeholder="〇〇市"
              />
              {errors.current_city && (
                <p className="text-red-500 text-sm">{errors.current_city.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {submitting ? '更新中...' : 'プロフィールを更新する'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileEditForm;