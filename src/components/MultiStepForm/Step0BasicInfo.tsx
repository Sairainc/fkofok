import { useWatch } from 'react-hook-form'
import { FormData } from '@/types/form'
import { Control, UseFormRegister } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
import { StepContainer, StepTitle, FormGroup, ButtonGroup, Select, Input, ErrorMessage, RadioGroup, RadioLabel } from './styles'

type Step0Props = {
  register: UseFormRegister<FormData>
  control: Control<FormData>
  onNext: (gender: 'men' | 'women') => void
}

const Step0BasicInfo = ({ register, control, onNext }: Step0Props) => {
  const { errors } = useFormState({ control })
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
    <StepContainer>
      <StepTitle>基本情報の入力</StepTitle>
      
      <FormGroup>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            性別<span className="text-red-500">*</span>
          </label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                {...register('gender')}
                value="men"
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3">男性</span>
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                {...register('gender')}
                value="women"
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3">女性</span>
            </RadioLabel>
          </RadioGroup>
          {errors.gender && (
            <ErrorMessage message={errors.gender.message as string} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電話番号<span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            placeholder="例：09012345678"
            {...register('phone_number')}
          />
          {errors.phone_number && (
            <ErrorMessage message={errors.phone_number.message as string} />
          )}
        </div>
      </FormGroup>

      <ButtonGroup onNext={handleNext} />
    </StepContainer>
  )
}

export default Step0BasicInfo 