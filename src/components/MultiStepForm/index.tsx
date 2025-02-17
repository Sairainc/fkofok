'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import Step0BasicInfo from './Step0BasicInfo'
import Step1PartyType from './Step1PartyType'
import Step2Preferences from './Step2Preferences'
import Step3PartyPreferences from './Step3PartyPreferences'
import Step5Profile from './Step5Profile'
import Step6CommonProfile from './Step6CommonProfile'
import Step7Photos from './Step7Photos'
import Step8Availability from './Step8Availability'
import { FormData } from '@/types/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchema } from '@/lib/validations/form'

type MultiStepFormProps = {
  lineId?: string  // オプショナルに変更
}

const MultiStepForm = ({ lineId }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [userType, setUserType] = useState<'men' | 'women' | null>(null)
  
  const methods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      gender: undefined,
      phone_number: '',
      birthdate_year: '',
      birthdate_month: '',
      birthdate_day: '',
      prefecture: '',
      city: '',
      occupation: '',
      party_type: '',
      preferred_age_range: '',
      preferred_personality: [],
      preferred_style: '',
      restaurant_preference: '',
      preferred_areas: [],
      available_dates: []
    },
    resolver: zodResolver(formSchema)
  })

  const { register, handleSubmit, formState: { errors }, trigger, control } = methods

  const nextStep = async () => {
    console.log('Current step:', currentStep)
    console.log('Form values:', methods.getValues())
    
    const isValid = await trigger()
    console.log('Validation result:', isValid)
    
    if (isValid) {
      setCurrentStep(prev => prev + 1)
    }
  }
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const onSubmit = async (data: FormData) => {
    try {
      // プロフィール情報を保存
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            line_id: lineId,
            user_type: userType,
            gender: data.gender,
            phone_number: data.phone_number,
            birthday: `${data.birthdate_year}-${data.birthdate_month.padStart(2, '0')}-${data.birthdate_day.padStart(2, '0')}`,
            prefecture: data.prefecture,
            city: data.city,
            occupation: data.occupation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ], {
          onConflict: 'line_id'
        })

      if (profileError) {
        throw new Error(`プロフィール保存エラー: ${profileError.message}`)
      }

      // 性別に応じたpreferencesテーブルに保存
      const preferencesTable = userType === 'men' ? 'men_preferences' : 'women_preferences'
      const { error: prefError } = await supabase
        .from(preferencesTable)
        .upsert([
          {
            line_id: lineId,
            party_type: data.party_type,
            preferred_age_range: data.preferred_age_range,
            preferred_personality: Array.isArray(data.preferred_personality) 
              ? data.preferred_personality 
              : [data.preferred_personality],
            preferred_style: data.preferred_style,
            restaurant_preference: data.restaurant_preference,
            preferred_areas: Array.isArray(data.preferred_areas)
              ? data.preferred_areas
              : [data.preferred_areas],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ], {
          onConflict: 'line_id'
        })

      if (prefError) {
        throw new Error(`設定保存エラー: ${prefError.message}`)
      }

      // 選択された日程を保存
      if (Array.isArray(data.available_dates) && data.available_dates.length > 0) {
        // 既存の日程を削除
        const { error: deleteError } = await supabase
          .from('availability')
          .delete()
          .eq('line_id', lineId)

        if (deleteError) {
          throw new Error(`既存の日程削除エラー: ${deleteError.message}`)
        }

        // 新しい日程を保存
        const availabilityData = data.available_dates.map((datetime: string) => ({
          line_id: lineId,
          datetime,
          created_at: new Date().toISOString(),
        }))

        const { error: availabilityError } = await supabase
          .from('availability')
          .insert(availabilityData) // upsertからinsertに変更

        if (availabilityError) {
          throw new Error(`日程保存エラー: ${availabilityError.message}`)
        }
      }

      // 登録完了後のリダイレクト
      window.location.href = '/prepare'

    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  // Step0BasicInfoに渡すprops
  const handleGenderSelect = (gender: 'men' | 'women') => {
    setUserType(gender)
    nextStep()
  }

  const steps = [
    { number: 1, title: '基本情報', icon: '👤' },
    { number: 2, title: '合コンタイプ', icon: '🎯' },
    { number: 3, title: '好みの相手', icon: '💝' },
    { number: 4, title: '合コン設定', icon: '🍷' },
    { number: 5, title: 'プロフィール', icon: '📋' },
    { number: 6, title: '詳細情報', icon: '📝' },
    { number: 7, title: '写真', icon: '📸' },
    { number: 8, title: '希望日時', icon: '📅' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-8">
        {/* プログレスバー */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg
                    ${currentStep >= index
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-600">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full">
            <div
              className="absolute h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* フォームコンテンツ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!userType ? (
            <Step0BasicInfo
              register={register}
              control={control}
              onNext={handleGenderSelect}
            />
          ) : (
            <>
              {currentStep === 1 && (
                <Step1PartyType
                  register={register}
                  _userType={userType}
                  onNext={nextStep}
                />
              )}
              {currentStep === 2 && (
                <Step2Preferences
                  register={register}
                  userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 3 && (
                <Step3PartyPreferences
                  register={register}
                  _userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 4 && (
                <Step5Profile
                  register={register}
                  userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 5 && (
                <Step6CommonProfile
                  register={register}
                  control={control}
                  _userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 6 && (
                <Step7Photos
                  register={register}
                  userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                  lineId={lineId}
                />
              )}
              {currentStep === 7 && (
                <Step8Availability
                  register={register}
                  userType={userType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
            </>
          )}
        </div>

        {/* エラーメッセージ */}
        {errors.available_dates && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 text-sm font-medium">
              {errors.available_dates.message?.toString()}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default MultiStepForm