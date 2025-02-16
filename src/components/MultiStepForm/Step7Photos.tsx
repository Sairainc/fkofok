import React from 'react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FormProps } from '@/types/form'

type Step7Props = {
  register: any
  userType: 'men' | 'women'
  onNext: () => void
  onPrev: () => void
  lineId: string
}

type PhotoUploadProps = FormProps & {
  onFileChange: (files: FileList) => void;
  previewUrls: string[];
}

const Step7Photos = ({ register, userType, onNext, onPrev, lineId }: Step7Props) => {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files?.[0]
      if (!file) return

      // ファイルサイズチェック (5MB以下)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('ファイルサイズは5MB以下にしてください')
      }

      // 画像ファイルタイプチェック
      if (!file.type.startsWith('image/')) {
        throw new Error('画像ファイルを選択してください')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${lineId}-${Date.now()}.${fileExt}`
      const filePath = `${userType}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
      setError('画像のアップロードに失敗しました。もう一度お試しください。')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">写真のアップロード</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            <span>{uploading ? 'アップロード中...' : '写真を選択'}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}

          {imageUrl && (
            <p className="text-green-500 mt-2">✓ アップロード完了</p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            5MB以下のJPEG、PNG形式の画像をアップロードしてください
          </p>
        </div>

        <input
          type="hidden"
          {...register('photo_url')}
          value={imageUrl || ''}
        />
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
          disabled={!imageUrl || uploading}
        >
          次へ進む
        </button>
      </div>
    </div>
  )
}

export default Step7Photos 