import type Beasties from 'beasties'
import type { Options } from 'beasties'

export async function getBeastiesOrCritters(outDir: string, options: Options = {}): Promise<Beasties | undefined> {
  try {
    const mod = await import('beasties')
    const BeastiesClass = mod.default || mod
    return new BeastiesClass({
      path: outDir,
      logLevel: 'warn',
      external: true,
      inlineFonts: true,
      preloadFonts: true,
      ...options,
    })
  }
  catch {
  }
  try {
    // @ts-expect-error type lost
    const mod = await import('critters')
    const CrittersClass = mod.default || mod
    console.warn('`critters` is deprecated. Please use `beasties` instead.')

    return new CrittersClass({
      path: outDir,
      logLevel: 'warn',
      external: true,
      inlineFonts: true,
      preloadFonts: true,
      ...options,
    })
  }
  catch (e) {
    return undefined
  }
}
