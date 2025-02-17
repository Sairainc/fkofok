import { z } from 'zod'

export const formSchema = z.object({
  gender: z.enum(['men', 'women'], { required_error: '性別を選択してください' }),
  phone_number: z.string().regex(/^[0-9]{10,11}$/, '有効な電話番号を入力してください'),
  party_type: z.string().min(1, '合コンのタイプを選択してください'),
  preferred_age_range: z.string().min(1, '希望年齢を選択してください'),
  preferred_personality: z.array(z.string()).min(1, '好みの性格を1つ以上選択してください'),
  preferred_style: z.string().min(1, '好みのスタイルを選択してください'),
  restaurant_preference: z.string().min(1, 'お店のタイプを選択してください'),
  preferred_areas: z.array(z.string()).min(1, 'エリアを選択してください'),
  birthdate_year: z.string().min(1, '年を選択してください'),
  birthdate_month: z.string().min(1, '月を選択してください'),
  birthdate_day: z.string().min(1, '日を選択してください'),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().min(1, '市区町村を選択してください'),
  occupation: z.string().min(1, '職業を選択してください'),
  available_dates: z.array(z.string()).min(1, '希望日時を1つ以上選択してください'),
  personality: z.array(z.string()).min(1, '性格を選択してください'),
  photo_url: z.string().min(1, '写真をアップロードしてください'),
  mbti: z.string().min(1, 'MBTIを選択してください'),
  style: z.string().min(1, 'スタイルを選択してください'),
  appearance: z.string().min(1, '外見の特徴を選択してください'),
  dating_experience: z.string().min(1, '合コン経験を選択してください'),
  vibe: z.string().min(1, '雰囲気を選択してください'),
  age: z.string().min(1, '年齢を入力してください')
}) 