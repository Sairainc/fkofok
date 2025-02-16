type Step5Props = {
  register: any
  userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step5Profile = ({ register, userType, onNext, onPrev }: Step5Props) => {
  const personalityOptions = [
    '明るい盛り上げ',
    '気遣いできるタイプ',
    '天然いじられ',
    'クール'
  ]

  const mbtiOptions = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const styleOptions = userType === 'men' ? [
    '筋肉質',
    'がっしり',
    'スリム',
    '普通'
  ] : [
    'スリム',
    '普通',
    'グラマー'
  ]

  const vibeOptions = [
    '乗りの良い体育会系',
    'こなれた港区',
    'クールなエリート',
    'クリエイティブ'
  ]

  const experienceOptions = [
    '0回',
    '1-2回',
    '3-5回',
    '6-10回',
    '11回以上'
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">プロフィール</h2>
      
      <div className="space-y-6">
        {/* 性格 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            自分の性格（複数選択可）
          </label>
          <div className="mt-2 space-y-2">
            {personalityOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  {...register('personality')}
                  value={option}
                  className="form-checkbox"
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* MBTI */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            MBTI
          </label>
          <select
            {...register('mbti')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {mbtiOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* 雰囲気 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            あえて自分の雰囲気を選ぶなら
          </label>
          <select
            {...register('style')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {vibeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* スタイル */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            自分のスタイル
          </label>
          <select
            {...register('appearance')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {styleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* 合コン経験 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            合コンの経験回数
          </label>
          <select
            {...register('dating_experience')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            {experienceOptions.map((option) => (
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

export default Step5Profile 