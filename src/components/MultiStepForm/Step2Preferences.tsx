type Step2Props = {
  register: any
  userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step2Preferences = ({ register, userType, onNext, onPrev }: Step2Props) => {
  const personalityOptions = [
    '明るい盛り上げタイプ',
    '気遣いできるしっかり',
    '天然いじられ',
    'クール',
    '小悪魔'
  ]

  const styleOptions = userType === 'men' ? [
    'スリム',
    '普通',
    'グラマー',
    '気にしない'
  ] : [
    'スリム',
    '普通',
    'グラマー',
    '気にしない'
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">好きなタイプは？</h2>
      
      <div className="space-y-4">
        {/* 年齢選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            希望年齢
          </label>
          <select
            {...register('preferred_age_range', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            <option value="18-24">18-24歳</option>
            <option value="25-29">25-29歳</option>
            <option value="30-34">30-34歳</option>
            <option value="35-39">35-39歳</option>
            <option value="40-">40歳以上</option>
          </select>
        </div>

        {/* 性格選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            好みの性格（複数選択可）
          </label>
          <div className="mt-2 space-y-2">
            {personalityOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  {...register('preferred_personality')}
                  value={option}
                  className="form-checkbox"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* スタイル選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            好みのスタイル（複数選択可）
          </label>
          <div className="mt-2 space-y-2">
            {styleOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  {...register('preferred_style')}
                  value={option}
                  className="form-checkbox"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
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

export default Step2Preferences 