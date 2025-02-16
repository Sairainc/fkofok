type Step6Props = {
  register: any
  _userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step6CommonProfile = ({ register, onNext, onPrev, _userType }: Step6Props) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">基本情報</h2>
      
      <div className="space-y-4">
        {/* 生年月日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            生年月日<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('birthdate', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        {/* 都道府県 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            お住まいの都道府県<span className="text-red-500">*</span>
          </label>
          <select
            {...register('prefecture', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">選択してください</option>
            <option value="東京都">東京都</option>
            <option value="神奈川県">神奈川県</option>
            <option value="千葉県">千葉県</option>
            <option value="埼玉県">埼玉県</option>
          </select>
        </div>

        {/* 職業 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            職業<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('occupation', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="例：会社員"
          />
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