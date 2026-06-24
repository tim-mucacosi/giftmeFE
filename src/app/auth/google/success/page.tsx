import { Suspense } from 'react'
import { GoogleSuccessClient } from './GoogleSuccessClient'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GoogleSuccessClient />
    </Suspense>
  )
}
