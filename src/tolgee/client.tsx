'use client'

import { TolgeeBase } from './shared'
import { TolgeeProvider, type TolgeeStaticData } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

type Props = {
  language: string
  staticData: TolgeeStaticData
  children: ReactNode
}

const tolgee = TolgeeBase().init()

export function TolgeeNextProvider({ language, staticData, children }: Props) {
  const router = useRouter()

  useEffect(() => {
    const { unsubscribe } = tolgee.on('permanentChange', () => {
      router.refresh()
    })
    return () => unsubscribe()
  }, [router])

  return (
    <TolgeeProvider
      tolgee={tolgee}
      options={{ useSuspense: false }}
      fallback={null}
      ssr={{ language, staticData }}
    >
      {children}
    </TolgeeProvider>
  )
}
