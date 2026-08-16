import { describe, expect, it } from 'vitest'
import { transformSync } from 'esbuild'

describe('esbuild probe', () => {
  it('can run transformSync inside vitest', () => {
    const result = transformSync('const x = <div/>', {
      loader: 'jsx',
      jsx: 'automatic',
      jsxImportSource: 'react',
    })
    expect(result.code).toContain('react/jsx-runtime')
  })
})
