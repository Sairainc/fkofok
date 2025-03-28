'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// エリア
const areaOptions = ['恵比寿', '新橋・銀座', 'どちらでもOK'] as const;

// レストラン選択
const restaurantOptions = ['安旨居酒屋', 'おしゃれダイニング'] as const;

// 男性用好み用スキーマ - すべてオプショナルに変更
const menPreferencesSchema = z.object({
  party_type: z.enum(['fun', 'serious']).optional(),
  preferred_age_min: z.number().min(20).max(60).optional(),
  preferred_age_max: z.number().min(20).max(60).optional(),
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
    .optional(),
  preferred_body_type: z.enum(['スリム', '普通', 'グラマー', '気にしない']).optional(),
  restaurant_preference: z
    .array(z.enum(restaurantOptions))
    .optional(),
  preferred_1areas: z.enum(areaOptions).optional(),
  preferred_2areas: z.enum(areaOptions).optional(),
  preferred_3areas: z.enum(areaOptions).optional(),
  datetime: z.string().optional(),
});

// 女性用好み用スキーマ - すべてオプショナルに変更
const womenPreferencesSchema = z.object({
  party_type: z.enum(['fun', 'serious']).optional(),
  preferred_age_min: z.number().min(20).max(60).optional(),
  preferred_age_max: z.number().min(20).max(60).optional(),
  preferred_personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
      ])
    )
    .optional(),
  preferred_body_type: z.enum(['筋肉質', '普通', 'スリム', '気にしない']).optional(),
  restaurant_preference: z
    .array(z.enum(restaurantOptions))
    .optional(),
  preferred_1areas: z.enum(areaOptions).optional(),
  preferred_2areas: z.enum(areaOptions).optional(),
  preferred_3areas: z.enum(areaOptions).optional(),
  datetime: z.string().optional(),
});

// 型定義
type MenPreferencesData = z.infer<typeof menPreferencesSchema>;
type WomenPreferencesData = z.infer<typeof womenPreferencesSchema>;
type PreferenceData = MenPreferencesData | WomenPreferencesData;

// データベースレコードの型定義
interface PreferenceRecord {
  id?: number;
  line_id: string;
  [key: string]: any; // データベースの他のフィールド用
}

type PreferencesEditFormProps = {
  userId: string;
  userGender: 'men' | 'women';
};

// 時間帯のオプション
const timeOptions = [
  '17:00 - 19:00',
  '19:00 - 21:00',
  '21:00 - 23:00',
];

// 日付オプションを生成（今日から2ヶ月分）
const generateDateOptions = () => {
  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // 週末（土日）だけをフィルタリング
    if (date.getDay() === 0 || date.getDay() === 6) {
      const formattedDate = date.toISOString().split('T')[0];
      dateOptions.push({
        value: formattedDate,
        label: new Date(formattedDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }),
      });
    }
  }
  return dateOptions;
};

const PreferencesEditForm = ({ userId, userGender }: PreferencesEditFormProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const router = useRouter();
  const dateOptions = generateDateOptions();

  // 女性用か男性用かでスキーマを切り替え
  const preferencesSchema = userGender === 'men' ? menPreferencesSchema : womenPreferencesSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PreferenceData>({
    resolver: zodResolver(preferencesSchema as any),
    defaultValues: {
      preferred_personality: [],
      restaurant_preference: [],
    },
  });

  // パーソナリティオプション（男性／女性で異なる）
  const personalityOptions = userGender === 'men' 
    ? ['明るい盛り上げタイプ', '気遣いできる', '天然いじられタイプ', 'クールなタイプ', '小悪魔'] 
    : ['明るい盛り上げタイプ', '気遣いできる', '天然いじられタイプ', 'クールなタイプ'];
  
  // 体型オプション（男性／女性で異なる）
  const bodyTypeOptions = userGender === 'men'
    ? ['スリム', '普通', 'グラマー', '気にしない']
    : ['筋肉質', '普通', 'スリム', '気にしない'];

  // 希望条件をロード
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        
        const tableName = userGender === 'men' ? 'men_preferences' : 'women_preferences';
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('line_id', userId)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // not found エラーコード
            throw error;
          }
          // データがない場合は早期リターン
          setLoading(false);
          return;
        }

        if (data) {
          // フォームに値をセット
          setValue('party_type', data.party_type);
          setValue('preferred_age_min', data.preferred_age_min);
          setValue('preferred_age_max', data.preferred_age_max);
          setValue('preferred_personality', data.preferred_personality || []);
          setValue('preferred_body_type', data.preferred_body_type as any);
          setValue('restaurant_preference', data.restaurant_preference || []);
          setValue('preferred_1areas', data.preferred_1areas as any || 'どちらでもOK');
          setValue('preferred_2areas', data.preferred_2areas as any || 'どちらでもOK');
          setValue('preferred_3areas', data.preferred_3areas as any || 'どちらでもOK');
          
          // 日時の処理
          if (data.datetime) {
            setValue('datetime', data.datetime);
            
            const [date, time] = data.datetime.split(' ');
            setSelectedDate(date);
            setSelectedTime(time);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, userGender, setValue]);

  // 日時の変更を処理
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setValue('datetime', `${selectedDate} ${selectedTime}`);
    }
  }, [selectedDate, selectedTime, setValue]);

  const onSubmit = async (formData: PreferenceData) => {
    try {
      setSubmitting(true);
      
      const tableName = userGender === 'men' ? 'men_preferences' : 'women_preferences';
      
      // 入力されたデータを処理
      const processedData: Record<string, any> = {};
      
      // フォームデータから入力されたフィールドのみを抽出
      Object.entries(formData).forEach(([key, value]) => {
        // 配列の場合（パーソナリティ、レストラン選択など）
        if (Array.isArray(value)) {
          if (value.length > 0) {
            processedData[key] = value;
          }
        } 
        // 数値の場合
        else if (typeof value === 'number') {
          if (!isNaN(value)) {
            processedData[key] = value;
          }
        }
        // 文字列の場合
        else if (typeof value === 'string') {
          if (value.trim() !== '') {
            processedData[key] = value.trim();
          }
        }
        // その他の値タイプ（nullやundefined以外）
        else if (value !== null && value !== undefined) {
          processedData[key] = value;
        }
      });
      
      // 既存のデータを確認
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .eq('line_id', userId)
        .single();
      
      let updateError;
      
      if (checkError && checkError.code === 'PGRST116') {
        // データが存在しない場合はINSERT
        const { error } = await supabase
          .from(tableName)
          .insert({
            line_id: userId,
            ...processedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        updateError = error;
      } else {
        // データが存在する場合はUPDATE
        // 既存データとマージして入力されていないフィールドを保持
        const mergedData = { 
          ...(existingData as PreferenceRecord), 
          ...processedData, 
          updated_at: new Date().toISOString() 
        };
        
        // IDとline_idフィールドはUPDATEに含めない
        delete mergedData.id;
        
        const { error } = await supabase
          .from(tableName)
          .update(mergedData)
          .eq('line_id', userId);
        
        updateError = error;
      }

      if (updateError) {
        throw updateError;
      }

      alert('希望条件が更新されました');
      router.refresh();
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('エラーが発生しました。もう一度お試しください。');
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
      {/* 合コンタイプ */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">希望する合コンタイプ</h3>
        <div className="space-y-2">
          <label className="block font-medium">合コンタイプ</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="fun"
                {...register('party_type')}
                className="mr-2"
              />
              盛り上がり重視
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="serious"
                {...register('party_type')}
                className="mr-2"
              />
              真剣度重視
            </label>
          </div>
          {errors.party_type && (
            <p className="text-red-500 text-sm">{errors.party_type.message}</p>
          )}
        </div>
      </div>

      {/* 好みの条件 */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">好みの条件</h3>
        
        {/* 年齢 */}
        <div className="space-y-2">
          <label className="block font-medium">希望年齢層</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              {...register('preferred_age_min', { 
                setValueAs: v => v === "" ? undefined : parseInt(v),
                valueAsNumber: true 
              })}
              className="w-20 p-2 border rounded-md"
              min={20}
              max={60}
            />
            <span>〜</span>
            <input
              type="number"
              {...register('preferred_age_max', { 
                setValueAs: v => v === "" ? undefined : parseInt(v),
                valueAsNumber: true 
              })}
              className="w-20 p-2 border rounded-md"
              min={20}
              max={60}
            />
            <span>歳</span>
          </div>
          {(errors.preferred_age_min || errors.preferred_age_max) && (
            <p className="text-red-500 text-sm">
              {errors.preferred_age_min?.message || errors.preferred_age_max?.message}
            </p>
          )}
        </div>

        {/* パーソナリティ */}
        <div className="space-y-2">
          <label className="block font-medium">希望するパーソナリティ（複数選択可）</label>
          <div className="grid grid-cols-2 gap-2">
            {personalityOptions.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  {...register('preferred_personality')}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.preferred_personality && (
            <p className="text-red-500 text-sm">{errors.preferred_personality.message}</p>
          )}
        </div>

        {/* 体型 */}
        <div className="space-y-2">
          <label htmlFor="preferred_body_type" className="block font-medium">
            希望する体型
          </label>
          <select
            id="preferred_body_type"
            {...register('preferred_body_type')}
            className="w-full p-2 border rounded-md"
          >
            <option value="">選択してください</option>
            {bodyTypeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.preferred_body_type && (
            <p className="text-red-500 text-sm">{errors.preferred_body_type.message}</p>
          )}
        </div>
      </div>

      {/* レストラン・場所 */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">レストラン・場所の希望</h3>
        
        {/* レストランタイプ */}
        <div className="space-y-2">
          <label className="block font-medium">希望するレストランタイプ（複数選択可）</label>
          <div className="grid grid-cols-2 gap-2">
            {restaurantOptions.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  {...register('restaurant_preference')}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.restaurant_preference && (
            <p className="text-red-500 text-sm">{errors.restaurant_preference.message}</p>
          )}
        </div>

        {/* エリア */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="preferred_1areas" className="block font-medium">
              第1希望エリア
            </label>
            <select
              id="preferred_1areas"
              {...register('preferred_1areas')}
              className="w-full p-2 border rounded-md"
            >
              {areaOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.preferred_1areas && (
              <p className="text-red-500 text-sm">{errors.preferred_1areas.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="preferred_2areas" className="block font-medium">
              第2希望エリア
            </label>
            <select
              id="preferred_2areas"
              {...register('preferred_2areas')}
              className="w-full p-2 border rounded-md"
            >
              {areaOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.preferred_2areas && (
              <p className="text-red-500 text-sm">{errors.preferred_2areas.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="preferred_3areas" className="block font-medium">
              第3希望エリア
            </label>
            <select
              id="preferred_3areas"
              {...register('preferred_3areas')}
              className="w-full p-2 border rounded-md"
            >
              {areaOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.preferred_3areas && (
              <p className="text-red-500 text-sm">{errors.preferred_3areas.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 希望日時 */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">希望日時</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block font-medium">
              日付
            </label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="time" className="block font-medium">
              時間帯
            </label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {timeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          {/* 非表示フィールド - 日時の組み合わせ用 */}
          <input type="hidden" {...register('datetime')} />
          
          {errors.datetime && (
            <p className="text-red-500 text-sm">{errors.datetime.message}</p>
          )}
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {submitting ? '更新中...' : '希望条件を更新する'}
        </button>
      </div>
    </form>
  );
};

export default PreferencesEditForm;