import { Button } from "boltdocs/client";
import { ArrowRight } from "lucide-react";
import { Terminal } from "./terminal";

export const Hero = () => (
  <section className="relative py-20 px-6 w-full">
    <div className="w-full mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-3 p-1 pr-4 rounded-full bg-white/3 border border-white/10 hover:border-primary-400/30 transition-all cursor-pointer group mb-10">
        <span className="px-3 py-1 rounded-full bg-linear-to-r from-primary-400 to-purple-700 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary-500/20">
          v2.5.3
        </span>
        <span className="text-sm font-bold text-text-main/60 group-hover:text-text-main transition-colors flex items-center gap-2">
          Available now!
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
      <h1 className="text-3xl md:text-5xl font-black text-text-main leading-[1.05] mb-8">
        The documentation engine <br className="hidden md:block" />
        <span className="bg-linear-to-r from-primary-400 via-purple-600 to-purple-200 bg-clip-text text-transparent">
          Modern
        </span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-main leading-relaxed mb-10">
        Boltdocs is a high-performance developer documentation, optimized for
        speed, and beautiful by design.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          href="/docs/guides/overview/introduction"
          iconPosition="right"
          icon={<ArrowRight className="size-4" />}
          rounded={"full"}
          className="bg-text-main text-bg-main"
        >
          Get Started
        </Button>
      </div>
      <Terminal />
    </div>
  </section>
);
