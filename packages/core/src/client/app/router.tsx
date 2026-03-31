import type React from 'react'
import { startTransition } from 'react'
import { RouterProvider } from 'react-aria-components'
import { useNavigate, useHref } from 'react-router-dom'

/**
 * Connects React Aria Components (RAC) to React Router.
 * This ensures all RAC links and buttons use client-side navigation
 * instead of full page reloads.
 */
export function BoltdocsRouterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <RouterProvider
      navigate={(to, options) => {
        startTransition(() => {
          navigate(to, options)
        })
      }}
      useHref={useHref}
    >
      {children as any}
    </RouterProvider>
  )
}
