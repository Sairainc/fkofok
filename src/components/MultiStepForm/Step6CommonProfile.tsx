import { UseFormRegister, Control, useFormState } from 'react-hook-form'
import { FormData } from '@/types/form'
import { useState, useEffect } from 'react'
import { cityData } from '@/lib/cityData' // 後で作成

type Step6Props = {
  register: UseFormRegister<FormData>
  control: Control<FormData>
  _userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step6CommonProfile = ({ register, control, onNext, onPrev, _userType }: Step6Props) => {
  const { errors } = useFormState({ control })
  const [selectedPrefecture, setSelectedPrefecture] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const today = new Date()

  const occupationOptions = [
    '会社員（事務系）',
    '会社員（技術系）',
    '会社員（営業系）',
    '公務員',
    '教職員',
    '医療関係',
    '自営業',
    'フリーランス',
    '学生',
    'その他'
  ]

  // 都道府県が変更されたら市区町村リストを更新
  useEffect(() => {
    if (selectedPrefecture) {
      setCities(cityData[selectedPrefecture] || [])
    }
  }, [selectedPrefecture])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">基本情報</h2>
      
      <div className="space-y-4">
        {/* 生年月日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            生年月日<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <select
              {...register('birthdate_year', { required: '年を選択してください' })}
              className="mt-1 w-1/3 rounded-md border-gray-300 shadow-sm"
            >
              <option value="">年</option>
              {Array.from({ length: 83 }, (_, i) => {
                const year = today.getFullYear() - 18 - i
                return (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                )
              })}
            </select>
            <select
              {...register('birthdate_month', { required: '月を選択してください' })}
              className="mt-1 w-1/3 rounded-md border-gray-300 shadow-sm"
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
            <select
              {...register('birthdate_day', { required: '日を選択してください' })}
              className="mt-1 w-1/3 rounded-md border-gray-300 shadow-sm"
            >
              <option value="">日</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}日
                </option>
              ))}
            </select>
          </div>
          {(errors.birthdate_year || errors.birthdate_month || errors.birthdate_day) && (
            <p className="text-red-500 text-sm mt-1">生年月日を入力してください</p>
          )}
        </div>

        {/* 都道府県 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            お住まいの都道府県<span className="text-red-500">*</span>
          </label>
          <select
            {...register('prefecture', { 
              required: '都道府県を選択してください',
              onChange: (e) => setSelectedPrefecture(e.target.value)
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {Object.keys(cityData).map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
          {errors.prefecture && (
            <p className="text-red-500 text-sm mt-1">{errors.prefecture.message}</p>
          )}
        </div>

        {/* 市区町村 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            市区町村<span className="text-red-500">*</span>
          </label>
          <select
            {...register('city', { 
              required: '市区町村を選択してください'
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            disabled={!selectedPrefecture}
          >
            <option value="">選択してください</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-sm">{errors.city.message}</p>
          )}
        </div>

        {/* 職業 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            職業<span className="text-red-500">*</span>
          </label>
          <select
            {...register('occupation', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {occupationOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
        >
          次へ進む
        </button>
      </div>
    </div>
  )
}

export default Step6CommonProfile 