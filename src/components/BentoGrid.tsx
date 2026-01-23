import { motion } from "framer-motion";
import { LucideIcon, Merge, Scissors, Minimize2, FileOutput, FileSpreadsheet, Edit3, FileText, Sparkles } from "lucide-react";

interface BentoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  size?: "normal" | "large" | "featured";
  delay?: number;
}

const BentoCard = ({ icon: Icon, title, description, onClick, size = "normal", delay = 0 }: BentoCardProps) => {
  const isFeatured = size === "featured";
  const isLarge = size === "large";

  return (
    <motion.button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-3xl bg-card p-6 text-left shadow-card card-hover
        ${isFeatured ? "md:col-span-2 md:row-span-2" : ""}
        ${isLarge ? "md:col-span-2" : ""}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className={`
            mb-4 flex items-center justify-center rounded-2xl bg-secondary
            ${isFeatured ? "h-16 w-16" : "h-12 w-12"}
          `}
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon className={`text-primary ${isFeatured ? "h-8 w-8" : "h-6 w-6"}`} />
        </motion.div>

        {/* Title */}
        <h3 className={`font-semibold text-foreground mb-2 ${isFeatured ? "text-2xl" : "text-lg"}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-muted-foreground ${isFeatured ? "text-base" : "text-sm"}`}>
          {description}
        </p>

        {/* Arrow indicator */}
        <motion.div
          className="mt-4 flex items-center gap-1 text-primary text-sm font-medium"
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
        >
          <span>Open tool</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  );
};

interface BentoGridProps {
  onSelectTool: (tool: string) => void;
}

const BentoGrid = ({ onSelectTool }: BentoGridProps) => {
  const tools = [
    {
      id: "ai-doctor",
      icon: Sparkles,
      title: "AI Document Doctor",
      description: "Analyze your documents with AI. Get grammar corrections, suggestions, and an improved version instantly.",
      size: "featured" as const,
    },
    {
      id: "merge",
      icon: Merge,
      title: "Merge PDF",
      description: "Combine multiple PDFs into one document.",
      size: "normal" as const,
    },
    {
      id: "split",
      icon: Scissors,
      title: "Split PDF",
      description: "Extract pages into separate files.",
      size: "normal" as const,
    },
    {
      id: "compress",
      icon: Minimize2,
      title: "Compress",
      description: "Reduce file size while keeping quality.",
      size: "large" as const,
    },
    {
      id: "convert",
      icon: FileOutput,
      title: "Image to PDF",
      description: "Convert images into PDF documents.",
      size: "normal" as const,
    },
    {
      id: "excel-to-pdf",
      icon: FileSpreadsheet,
      title: "Excel to PDF",
      description: "Convert spreadsheets to formatted PDFs.",
      size: "normal" as const,
    },
    {
      id: "edit-pdf",
      icon: Edit3,
      title: "Edit PDF",
      description: "Add text, signatures, and images to your PDFs.",
      size: "normal" as const,
    },
    {
      id: "pdf-to-text",
      icon: FileText,
      title: "PDF to Text",
      description: "Extract all text content from PDFs.",
      size: "normal" as const,
    },
  ];

  return (
    <section id="tools" className="py-24">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-headline font-semibold text-foreground mb-4">
            All the tools you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Professional PDF tools with AI superpowers. Select any tool to get started.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <BentoCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onClick={() => onSelectTool(tool.id)}
              size={tool.size}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
