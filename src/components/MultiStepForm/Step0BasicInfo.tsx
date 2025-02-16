import { useWatch } from 'react-hook-form'
import { FormData } from '@/types/form'
import { Control, UseFormRegister } from 'react-hook-form'

type Step0Props = {
  register: UseFormRegister<FormData>
  control: Control<FormData>
  onNext: (gender: 'men' | 'women') => void
}

const Step0BasicInfo = ({ register, control, onNext }: Step0Props) => {
  const gender = useWatch({ 
    control,
    name: 'gender' 
  }) as 'men' | 'women'

  const handleNext = () => {
    if (gender) {
      onNext(gender)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">基本情報の入力</h2>
      
      <div className="space-y-4">
        {/* 性別選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            性別<span className="text-red-500">*</span>
          </label>
          <select
            {...register('gender', { required: '性別を選択してください' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="men">男性</option>
            <option value="women">女性</option>
          </select>
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            電話番号<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('phone_number', { 
              required: '電話番号を入力してください',
              pattern: {
                value: /^[0-9]{10,11}$/,
                message: '有効な電話番号を入力してください'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="例：09012345678"
          />
        </div>
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={handleNext}
          disabled={!gender}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
        >
          次へ進む
        </button>
      </div>
    </div>
  )
}

export default Step0BasicInfo 