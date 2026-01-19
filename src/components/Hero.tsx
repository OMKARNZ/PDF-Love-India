import { ArrowDown, Shield, Zap, Globe } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            100% Free & Secure
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground animate-fade-in-up md:text-5xl lg:text-6xl">
            The PDF Tool{" "}
            <span className="text-gradient-india">India Loves</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg text-muted-foreground animate-fade-in-up md:text-xl" style={{ animationDelay: "0.1s" }}>
            Merge, split, compress, and convert PDFs instantly. 
            All processing happens in your browser — your files never leave your device.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <a
              href="#tools"
              className="group inline-flex items-center gap-2 rounded-2xl gradient-india px-8 py-4 text-lg font-semibold text-white shadow-button transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Tools
              <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-center gap-3 rounded-xl bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">100% Private</p>
                <p className="text-sm text-muted-foreground">Files stay on your device</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Lightning Fast</p>
                <p className="text-sm text-muted-foreground">No upload wait time</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-india-blue/10">
                <Globe className="h-5 w-5 text-india-blue" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Made for India</p>
                <p className="text-sm text-muted-foreground">Works offline too</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
