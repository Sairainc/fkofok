import { UseFormRegister } from 'react-hook-form'
import { FormData } from '@/types/form'

type Step1Props = {
  register: UseFormRegister<FormData>
  _userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
}

const Step1PartyType = ({ register, onNext, _userType }: Step1Props) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">どんな合コンにしたい？</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium text-gray-700">
            合コンのタイプを選択してください
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                {...register('party_type', { required: true })}
                value="casual"
                className="form-radio"
              />
              <span>カジュアルな雰囲気で楽しく</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                {...register('party_type', { required: true })}
                value="serious"
                className="form-radio"
              />
              <span>真面目に出会いを探したい</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
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

export default Step1PartyType 