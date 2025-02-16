'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const DynamicMultiStepForm = dynamic(() => import('@/components/MultiStepForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function Form() {
  const testLineId = "test_user_123"
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicMultiStepForm lineId={testLineId} />
    </Suspense>
  )
}
