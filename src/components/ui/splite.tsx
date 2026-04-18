'use client'

import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent opacity-60" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
