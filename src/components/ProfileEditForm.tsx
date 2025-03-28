// ProfileEditForm.jsx
'use client';

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

// プロフィールスキーマを更新し、ほとんどのフィールドをオプションに変更
const profileSchema = z.object({
  gender: z.enum(['men', 'women']).optional(),
  phone_number: z
    .string()
    .min(10, '電話番号が短すぎます')
    .max(11, '電話番号が長すぎます')
    .regex(/^[0-9]+$/, '数字のみ入力してください')
    .optional(),
  personality: z.array(z.string()).optional(),
  mbti: z.enum(mbtiOptions).optional(),
  appearance: z.string().optional(),
  style: z.string().optional(),
  dating_experience: z.string().optional(),
  education: z.enum(educationOptions).optional(),
  hometown_prefecture: z.enum(prefectures).optional(),
  hometown_city: z.string().optional(),
  prefecture: z.enum(prefectures).optional(),
  current_city: z.string().optional(),
  birth_date: z.string()
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, '正しい形式で入力してください（例：2000/01/01）')
    .refine((date) => {
      if (!date) return true; // 空の場合は検証をスキップ
      const [year, month, day] = date.split('/').map(Number);
      const inputDate = new Date(year, month - 1, day);
      return inputDate instanceof Date && !isNaN(inputDate.getTime());
    }, '正しい日付を入力してください')
    .optional(),
  occupation: z.enum(occupations).optional(),
  income: z.enum(incomeRanges).optional(),
  // メールアドレスは必須フィールドとして残す
  email: z.string().email('正しいメールアドレスを入力してください'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileEditFormProps = {
  userId: string;
};

const ProfileEditForm = ({ userId }: ProfileEditFormProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [originalData, setOriginalData] = useState<any>(null); // 元のデータを保存
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
          .eq('id', userId)
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
          setValue('education', data.education as any || '');
          setValue('hometown_prefecture', data.hometown_prefecture as any || '');
          setValue('hometown_city', data.hometown_city || '');
          setValue('prefecture', data.prefecture as any || '');
          setValue('current_city', data.current_city || '');
          setValue('birth_date', data.birthdate?.replace(/-/g, '/') || '');
          setValue('occupation', data.occupation as any || '');
          setValue('income', data.income as any || '');
          setValue('email', data.email || '');
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

      // 送信データを準備
      const updatedData: Record<string, unknown> = { 
        gender: gender, // 性別は常に含める
        updated_at: new Date().toISOString()
      };

      // 未入力でないフィールドのみを送信データに含める
      Object.entries(data).forEach(([key, value]) => {
        // genderキーはすでに設定済みのためスキップ
        if (key === 'gender') return;
        
        // 配列の場合（パーソナリティなど）
        if (Array.isArray(value)) {
          // 空でなければデータに含める
          if (value.length > 0) {
            updatedData[key] = value;
          }
        } 
        // 文字列の場合
        else if (typeof value === 'string') {
          // トリムして空でなければデータに含める
          const trimmedValue = value.trim();
          if (trimmedValue !== '') {
            // birth_dateフィールドの場合は形式を変換
            if (key === 'birth_date') {
              updatedData['birthdate'] = trimmedValue.replace(/\//g, '-');
            } else {
              updatedData[key] = trimmedValue;
            }
          }
        }
        // その他の値タイプ（null以外）
        else if (value !== null && value !== undefined) {
          updatedData[key] = value;
        }
      });

      console.log('Updating profile with data:', updatedData);
      
      // データ更新処理
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', userId);

      if (error) throw error;

      alert('プロフィールが更新されました！');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('プロフィールの更新中にエラーが発生しました。');
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
  );
};

export default ProfileEditForm;