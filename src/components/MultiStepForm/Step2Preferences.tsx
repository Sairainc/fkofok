import { UseFormRegister } from 'react-hook-form'
import { FormData } from '@/types/form'
import { StepContainer, StepTitle, FormGroup, CheckboxGroup, CheckboxLabel, ButtonGroup } from './styles'

type Step2Props = {
  register: UseFormRegister<FormData>
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
    <StepContainer>
      <StepTitle>好みのタイプ</StepTitle>
      <FormGroup>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            好みのスタイル
          </label>
          <CheckboxGroup>
            {styleOptions.map((option) => (
              <CheckboxLabel key={option}>
                <input
                  type="checkbox"
                  {...register('preferred_style')}
                  value={option}
                  className="w-4 h-4 text-primary"
                />
                <span className="ml-3">{option}</span>
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </div>
      </FormGroup>
      <ButtonGroup onNext={onNext} onPrev={onPrev} />
    </StepContainer>
  )
}

export default Step2Preferences 