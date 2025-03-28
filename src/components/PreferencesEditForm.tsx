'use client';

import React from 'react';
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

// 男性用好み用スキーマ - すべて必須に変更
const menPreferencesSchema = z.object({
  party_type: z.enum(['fun', 'serious'], {
    errorMap: () => ({ message: '合コンタイプを選択してください' })
  }),
  preferred_age_min: z.number().min(20, '20歳以上を選択してください').max(60, '60歳以下を選択してください'),
  preferred_age_max: z.number().min(20, '20歳以上を選択してください').max(60, '60歳以下を選択してください'),
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
    .min(1, '少なくとも1つ選択してください'),
  preferred_body_type: z.array(z.enum(['グラマー', '普通', 'スリム', '気にしない'])).min(1, '体型を選択してください'),
  restaurant_preference: z
    .array(z.enum(restaurantOptions))
    .min(1, '少なくとも1つ選択してください'),
  preferred_1areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第1希望エリアを選択してください' })
  }),
  preferred_2areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第2希望エリアを選択してください' })
  }),
  preferred_3areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第3希望エリアを選択してください' })
  }),
});

// 女性用好み用スキーマ - すべて必須に変更
const womenPreferencesSchema = z.object({
  party_type: z.enum(['fun', 'serious'], {
    errorMap: () => ({ message: '合コンタイプを選択してください' })
  }),
  preferred_age_min: z.number().min(20, '20歳以上を選択してください').max(60, '60歳以下を選択してください'),
  preferred_age_max: z.number().min(20, '20歳以上を選択してください').max(60, '60歳以下を選択してください'),
  preferred_personality: z
    .array(
      z.enum([
        '明るい盛り上げタイプ',
        '気遣いできる',
        '天然いじられタイプ',
        'クールなタイプ',
      ])
    )
    .min(1, '少なくとも1つ選択してください'),
  preferred_body_type: z.array(z.enum(['筋肉質', 'がっしり', 'スリム', '普通', '気にしない'])).min(1, '体型を選択してください'),
  restaurant_preference: z
    .array(z.enum(restaurantOptions))
    .min(1, '少なくとも1つ選択してください'),
  preferred_1areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第1希望エリアを選択してください' })
  }),
  preferred_2areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第2希望エリアを選択してください' })
  }),
  preferred_3areas: z.enum(areaOptions, {
    errorMap: () => ({ message: '第3希望エリアを選択してください' })
  }),
});

// 型定義
type MenPreferencesData = z.infer<typeof menPreferencesSchema>;
type WomenPreferencesData = z.infer<typeof womenPreferencesSchema>;
type PreferenceData = MenPreferencesData | WomenPreferencesData;

// データベースレコードの型定義
interface _PreferenceRecord {
  id?: number;
  line_id: string;
  [key: string]: any; // データベースの他のフィールド用
}

type PreferencesEditFormProps = {
  userId: string;
};

const PreferencesEditForm: React.FC<PreferencesEditFormProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gender, setGender] = useState<'men' | 'women'>('men'); // デフォルト値を設定
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // 性別に基づいてスキーマを切り替え
  const preferencesSchema = gender === 'men' ? menPreferencesSchema : womenPreferencesSchema;

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
      preferred_body_type: [],
    },
  });

  // パーソナリティオプション（男性／女性で異なる）
  const personalityOptions = gender === 'men' 
    ? ['明るい盛り上げタイプ', '気遣いできる', '天然いじられタイプ', 'クールなタイプ', '小悪魔'] 
    : ['明るい盛り上げタイプ', '気遣いできる', '天然いじられタイプ', 'クールなタイプ'];
  
  // 体型オプション（男性／女性で異なる）
  const bodyTypeOptions = gender === 'men'
    ? ['グラマー', '普通', 'スリム', '気にしない'] 
    : ['筋肉質','がっしり', 'スリム', '普通', '気にしない'];

  // ユーザーの性別を取得
  useEffect(() => {
    const fetchUserGender = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('gender')
          .eq('line_id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user gender:', error);
          return;
        }
        
        if (data && data.gender) {
          setGender(data.gender);
        }
      } catch (error) {
        console.error('Error loading gender:', error);
      }
    };
    
    fetchUserGender();
  }, [userId]);

  // 希望条件をロード
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        
        const tableName = gender === 'men' ? 'men_preferences' : 'women_preferences';
        
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
          setValue('preferred_body_type', Array.isArray(data.preferred_body_type) ? data.preferred_body_type : [data.preferred_body_type].filter(Boolean));
          setValue('restaurant_preference', data.restaurant_preference || []);
          setValue('preferred_1areas', data.preferred_1areas as any || 'どちらでもOK');
          setValue('preferred_2areas', data.preferred_2areas as any || 'どちらでもOK');
          setValue('preferred_3areas', data.preferred_3areas as any || 'どちらでもOK');
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    if (gender) {
      fetchPreferences();
    }
  }, [userId, gender, setValue]);

  const onSubmit = async (formData: PreferenceData) => {
    try {
      setSubmitting(true);
      console.log('送信データ:', formData);
      
      const tableName = gender === 'men' ? 'men_preferences' : 'women_preferences';
      
      // 送信データを準備
      const processedData: Record<string, any> = {};
      
      // すべてのフィールドを送信データに含める
      Object.entries(formData).forEach(([key, value]) => {
        // 配列の場合（パーソナリティ、レストラン選択など）
        if (Array.isArray(value)) {
          if (value.length === 0 && key === 'preferred_body_type') {
            console.error('体型が選択されていません');
            throw new Error('体型を選択してください');
          }
          processedData[key] = value;
        } 
        // 数値の場合
        else if (typeof value === 'number') {
          processedData[key] = value;
        }
        // 文字列の場合
        else if (typeof value === 'string') {
          processedData[key] = value;
        }
        // その他の値タイプ
        else if (value !== null && value !== undefined) {
          processedData[key] = value;
        }
      });
      
      console.log('処理後データ:', processedData);

      // 必須フィールドの検証
      if (!processedData.preferred_body_type || processedData.preferred_body_type.length === 0) {
        throw new Error('体型を選択してください');
      }
      
      // 既存のデータを確認
      const { data: _data, error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .eq('line_id', userId)
        .single();
      
      let updateError;
      
      if (checkError && checkError.code === 'PGRST116') {
        // データが存在しない場合はINSERT
        console.log('新規データ挿入');
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
        console.log('既存データ更新');
        const { error } = await supabase
          .from(tableName)
          .update({
            ...processedData,
            updated_at: new Date().toISOString()
          })
          .eq('line_id', userId);
        
        updateError = error;
      }

      if (updateError) {
        console.error('更新エラー:', updateError);
        throw updateError;
      }

      setShowSuccessPopup(true);
      router.refresh();
    } catch (error) {
      console.error('希望条件の更新中にエラーが発生しました:', error);
      setErrorMessage(error instanceof Error ? error.message : 'すべての項目を入力してください。');
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
              <p className="text-gray-500 mb-6">希望条件が正常に更新されました。</p>
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
            <label className="block font-medium">希望する体型（複数選択可）</label>
            <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-gray-50">
              {bodyTypeOptions.map(option => (
                <label key={option} className="flex items-center p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    value={option}
                    {...register('preferred_body_type')}
                    className="mr-2 w-4 h-4 accent-primary"
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.preferred_body_type && (
              <p className="text-red-500 text-sm mt-1">{errors.preferred_body_type.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">※少なくとも1つ選択してください</p>
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
    </>
  );
};

export default PreferencesEditForm;