import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface HeadProps {
  siteTitle: string
  siteDescription?: string
  routes: Array<{ path: string; title: string; description?: string }>
}

export function Head({ siteTitle, siteDescription, routes }: HeadProps) {
  const location = useLocation()

  useEffect(() => {
    // Find the current route's metadata
    const currentRoute = routes?.find?.((r) => r.path === location.pathname)
    const pageTitle = currentRoute?.title
    const pageDescription = currentRoute?.description || siteDescription || ''

    // Update document title
    document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle

    // Update or create meta description
    let metaDesc = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = pageDescription

    // Update OG tags
    setMetaTag('property', 'og:title', document.title)
    setMetaTag('property', 'og:description', pageDescription)
    setMetaTag('property', 'og:type', 'article')
    setMetaTag('property', 'og:url', window.location.href)

    // Twitter card
    setMetaTag('name', 'twitter:card', 'summary')
    setMetaTag('name', 'twitter:title', document.title)
    setMetaTag('name', 'twitter:description', pageDescription)

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = window.location.origin + location.pathname
  }, [location.pathname, siteTitle, siteDescription, routes])

  return null // This component only manages <head>, no visual output
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector(
    `meta[${attr}="${key}"]`,
  ) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}
