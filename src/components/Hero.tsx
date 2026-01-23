import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Shield, Zap } from "lucide-react";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="container text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-card px-5 py-2 shadow-card"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Now with AI-Powered Features
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-display-sm md:text-display font-semibold tracking-tight text-foreground mb-6"
        >
          Work with PDFs.
          <br />
          <span className="text-gradient">Effortlessly.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12"
        >
          Merge, split, compress, and analyze your documents with AI.
          <br className="hidden md:block" />
          Everything happens in your browser. Your files never leave your device.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <motion.a
            href="#tools"
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-lg font-medium text-background shadow-card transition-all"
            whileHover={{ scale: 1.02, boxShadow: "var(--shadow-card-hover)" }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
            <ArrowDown className="h-5 w-5" />
          </motion.a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={itemVariants}
          className="mt-20 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: Shield, label: "Privacy First" },
            { icon: Zap, label: "Lightning Fast" },
            { icon: Sparkles, label: "AI Powered" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          variants={itemVariants}
          className="mt-16 mx-auto max-w-4xl"
        >
          <motion.div
            className="rounded-3xl bg-card p-8 shadow-card-hover"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-secondary animate-pulse-subtle"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-3 w-24 rounded-full bg-primary/20" />
              <div className="h-3 w-16 rounded-full bg-secondary" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
