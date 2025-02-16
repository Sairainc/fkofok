'use client'

import { MultiStepForm } from '@/components/MultiStepForm'

export default function Form(): React.ReactNode {
  // Hardcoded LINE ID for testing or get it from a different source
  const testLineId = "test_user_123" // TODO: Replace with actual LINE ID source

  return <MultiStepForm lineId={testLineId} />
}
