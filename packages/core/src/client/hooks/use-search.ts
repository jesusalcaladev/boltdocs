import { useState, useMemo } from 'react'
import type { ComponentRoute } from '@client/types'

export function useSearch(routes: ComponentRoute[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    if (!query) {
      return routes.slice(0, 10).map((r) => ({
        id: r.path,
        title: r.title,
        path: r.path,
        bio: r.description || '',
        groupTitle: r.groupTitle,
      }))
    }

    const results: any[] = []
    const lowerQuery = query.toLowerCase()

    for (const route of routes) {
      if (route.title?.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: route.path,
          title: route.title,
          path: route.path,
          bio: route.description || '',
          groupTitle: route.groupTitle,
        })
      }

      if (route.headings) {
        for (const heading of route.headings) {
          if (heading.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: `${route.path}#${heading.id}`,
              title: heading.text,
              path: `${route.path}#${heading.id}`,
              bio: `Heading in ${route.title}`,
              groupTitle: route.title,
              isHeading: true,
            })
          }
        }
      }
    }

    // Deduplicate by path
    const seen = new Set()
    return results
      .filter((r) => {
        if (seen.has(r.path)) return false
        seen.add(r.path)
        return true
      })
      .slice(0, 10)
  }, [routes, query])

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    list,
    input: {
      value: query,
      onChange: (e: any) => setQuery(e.target.value),
    },
  }
}
