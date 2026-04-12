import { describe, it, expect } from 'vitest'
import { replaceMetaTags } from '../../packages/core/src/node/ssg/meta'

describe('ssg meta', () => {
  const baseHtml = `<!doctype html>
<html>
<head>
  <title>Original Title</title>
  <meta name="description" content="Original Description">
  <meta property="og:title" content="Original OG Title">
  <meta property="og:description" content="Original OG Description">
  <meta name="twitter:title" content="Original Twitter Title">
  <meta name="twitter:description" content="Original Twitter Description">
</head>
<body></body>
</html>`

  it('should replace title tag', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'New Title',
      description: 'New Description',
    })

    expect(result).toContain('<title>New Title</title>')
    expect(result).not.toContain('<title>Original Title</title>')
  })

  it('should replace description meta', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Title',
      description: 'Updated Description',
    })

    expect(result).toContain('<meta name="description" content="Updated Description">')
  })

  it('should replace og:title meta', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'OG Title',
      description: 'Desc',
    })

    expect(result).toContain('<meta property="og:title" content="OG Title">')
  })

  it('should replace og:description meta', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Title',
      description: 'OG Desc',
    })

    expect(result).toContain('<meta property="og:description" content="OG Desc">')
  })

  it('should replace twitter:title meta', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Twitter Title',
      description: 'Desc',
    })

    expect(result).toContain('<meta name="twitter:title" content="Twitter Title">')
  })

  it('should replace twitter:description meta', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Title',
      description: 'Twitter Desc',
    })

    expect(result).toContain('<meta name="twitter:description" content="Twitter Desc">')
  })

  it('should escape HTML in title', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Title <script>alert("xss")</script>',
      description: 'Description',
    })

    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;')
  })

  it('should escape HTML in description', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Title',
      description: 'Description with "quotes" and <tags>',
    })

    expect(result).toContain('&quot;quotes&quot;')
    expect(result).toContain('&lt;tags&gt;')
  })

  it('should replace all meta tags together', () => {
    const result = replaceMetaTags(baseHtml, {
      title: 'Final Title',
      description: 'Final Description',
    })

    expect(result).toContain('<title>Final Title</title>')
    expect(result).toContain('<meta name="description" content="Final Description">')
    expect(result).toContain('<meta property="og:title" content="Final Title">')
    expect(result).toContain('<meta property="og:description" content="Final Description">')
    expect(result).toContain('<meta name="twitter:title" content="Final Title">')
    expect(result).toContain('<meta name="twitter:description" content="Final Description">')
  })
})
