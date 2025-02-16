import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FormProps } from '@/types/form'

type AvailabilityCount = {
  datetime: string
  count: number
}

const Step8Availability = ({ register, onPrev }: FormProps) => {
  const [availabilityCounts, setAvailabilityCounts] = useState<AvailabilityCount[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    // 選択可能な日程を生成
    const dates = generateAvailableDates()
    setAvailableDates(dates)

    // 人気の日程を取得
    fetchAvailabilityCounts()
  }, [])

  // 次週から1ヶ月後までの金土日の19時の日程を生成
  const generateAvailableDates = () => {
    const dates: string[] = []
    const now = new Date()
    
    // 来週の月曜日を取得
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7)
    
    // 来週の金曜日を取得
    const nextFriday = new Date(nextMonday)
    nextFriday.setDate(nextMonday.getDate() + (5 - nextMonday.getDay()))
    
    const oneMonthLater = new Date(now)
    oneMonthLater.setMonth(now.getMonth() + 1)

    const currentDate = new Date(nextFriday)
    while (currentDate <= oneMonthLater) {
      const day = currentDate.getDay()
      // 金土日のみ
      if (day === 5 || day === 6 || day === 0) {
        // 19時の日程を追加
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} 19:00:00`
        dates.push(dateStr)
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  // 人気の日程を取得
  const fetchAvailabilityCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('datetime, count')
        .gt('datetime', new Date().toISOString())
        .order('count', { ascending: false })

      if (error) throw error

      setAvailabilityCounts(data as AvailabilityCount[])
    } catch (error) {
      console.error('Error fetching availability counts:', error)
    }
  }

  // 日程の人気度を取得
  const getPopularityLabel = (datetime: string) => {
    const count = availabilityCounts.find(ac => ac.datetime === datetime)?.count || 0
    if (count >= 5) return '🔥 人気'
    if (count >= 3) return '👥 まあまあ'
    return ''
  }

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    return `${date.getMonth() + 1}月${date.getDate()}日(${dayOfWeek}) 19:00`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">希望日時の選択</h2>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          参加可能な日程を選択してください（必須・複数選択可）
        </p>
        
        <div className="grid gap-3">
          {availableDates.map((datetime) => (
            <label key={datetime} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                {...register('available_dates', { 
                  required: '希望日時を1つ以上選択してください' 
                })}
                value={datetime}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <span className="ml-3">{formatDate(datetime)}</span>
              <span className="ml-auto text-sm text-orange-500 font-medium">
                {getPopularityLabel(datetime)}
              </span>
            </label>
          ))}
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
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
        >
          登録する
        </button>
      </div>
    </div>
  )
}

export default Step8Availability 