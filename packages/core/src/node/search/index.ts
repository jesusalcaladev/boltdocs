import type { RouteMeta } from '../routes/types'

export interface SearchDocument {
  id: string
  title: string
  content: string
  url: string
  display: string
  locale?: string
  version?: string
}

/**
 * Generates a flat list of searchable documents from the route metadata.
 * Each page is indexed as a primary document, and its sections (headings)
 * are indexed as secondary documents to provide granular search results.
 */
export function generateSearchData(routes: RouteMeta[]): SearchDocument[] {
  const documents: SearchDocument[] = []

  for (const route of routes) {
    // 1. Index the main page
    documents.push({
      id: route.path,
      title: route.title,
      content: route._content || '',
      url: route.path,
      display: route.groupTitle
        ? `${route.groupTitle} > ${route.title}`
        : route.title,
      locale: route.locale,
      version: route.version,
    })

    // 2. Index headings as sub-documents for deep linking
    if (route.headings) {
      for (const heading of route.headings) {
        // We find the content belonging to this heading?
        // For now, indexing just the heading text and a bit of context is standard.
        // Deep full-text mapping to specific headings is more complex.
        documents.push({
          id: `${route.path}#${heading.id}`,
          title: heading.text,
          content: `${heading.text} in ${route.title}`,
          url: `${route.path}#${heading.id}`,
          display: `${route.title} > ${heading.text}`,
          locale: route.locale,
          version: route.version,
        })
      }
    }
  }

  return documents
}
