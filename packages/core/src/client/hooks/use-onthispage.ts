import { useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

/**
 * Hook to manage and provide current page headings for the OnThisPage component.
 */
export function useOnThisPage(headings: Heading[] = []) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // We keep the signature the same for backward compatibility,
  // but the activeId tracking is now handled by AnchorProvider in the primitives.

  return {
    headings,
    activeId,
    setActiveId,
  }
}
