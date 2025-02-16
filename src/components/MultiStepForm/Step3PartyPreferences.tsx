type Step3Props = {
  register: any
  _userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step3PartyPreferences = ({ register, _userType, onNext, onPrev }: Step3Props) => {
  const restaurantOptions = [
    { value: 'casual', label: '安旨居酒屋' },
    { value: 'stylish', label: 'おしゃれカジュアル' }
  ]

  const areaOptions = [
    { value: 'ebisu', label: '恵比寿' },
    { value: 'ginza', label: '新橋・銀座' },
    { value: 'both', label: 'どちらでもOK' }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">どんな合コンにしたいか</h2>
      
      <div className="space-y-4">
        {/* お店のタイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            希望するお店のタイプ
          </label>
          <div className="mt-2 space-y-2">
            {restaurantOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  {...register('restaurant_preference', { required: true })}
                  value={option.value}
                  className="form-radio"
                />
                <span className="ml-2">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* エリア選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            開催エリアの希望
          </label>
          <div className="mt-2 space-y-2">
            {areaOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  {...register('preferred_areas', { required: true })}
                  value={option.value}
                  className="form-radio"
                />
                <span className="ml-2">{option.label}</span>
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

export default Step3PartyPreferences 