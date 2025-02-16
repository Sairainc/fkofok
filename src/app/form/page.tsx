'use client'

import dynamic from 'next/dynamic'

const DynamicMultiStepForm = dynamic(() => import('@/components/MultiStepForm'), {
  ssr: false,
})

export default function Form(): React.ReactNode {
  const testLineId = "test_user_123"
  return <DynamicMultiStepForm lineId={testLineId} />
}
