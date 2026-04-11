import { FeaturesGrid } from '../features-grid'
import { CTASection } from '../cta-section'
import { Hero } from '../hero'

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden">
      <main className="w-full flex relative flex-col items-center justify-center mx-auto">
        <Hero />
        <FeaturesGrid />
        <CTASection />
      </main>
    </div>
  )
}
