import { Button } from 'boltdocs/mdx'

export const CTASection = () => (
  <section className="relative py-15 px-6 overflow-hidden w-full">
    <img
      src="/mesh-gradient.webp"
      alt=""
      className="absolute top-0 rounded-none left-0 w-full h-full object-cover -z-10"
    />
    <img src='/light.svg' className='absolute -bottom-18 -left-20 size-96 opacity-20 rotate-45 -z-10'/>
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl md:text-4xl font-black text-white border-0 mb-4">
        Start building your docs <br className="hidden md:block" /> in seconds.
      </h2>
      <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Start creating your documentation with Boltdocs in a quick and easy way.
      </p>
      <div className="flex justify-center">
        <Button href='/docs/guides/overview/introduction' className="bg-bg-main text-text-main">Get Started</Button>
      </div>
    </div>
  </section>
)
