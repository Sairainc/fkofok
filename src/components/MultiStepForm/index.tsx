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

type MultiStepFormProps = {
  lineId: string
}

const MultiStepForm = ({ lineId }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [userType, setUserType] = useState<'men' | 'women' | null>(null)
  
  const methods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      gender: undefined,
      phone_number: '',
      birthdate: '',
      prefecture: '',
      occupation: '',
      party_type: '',
      preferred_age_range: '',
      preferred_personality: [],
      preferred_style: '',
      restaurant_preference: '',
      preferred_areas: [],
      available_dates: []
    }
  })

  const { register, handleSubmit, formState: { errors }, trigger, control } = methods

  const nextStep = async () => {
    const isValid = await trigger() // 現在のステップのバリデーションを実行
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
            birthdate: data.birthdate,
            prefecture: data.prefecture,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {currentStep === 0 && (
        <Step0BasicInfo
          register={register}
          control={control}
          onNext={handleGenderSelect}
        />
      )}
      {userType && currentStep > 0 && (
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
      {errors.available_dates && (
        <p className="text-red-500 text-sm">
          {errors.available_dates.message?.toString()}
        </p>
      )}
    </form>
  )
}

export default MultiStepForm