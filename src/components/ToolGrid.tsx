import { Merge, Scissors, Minimize2, FileOutput, RotateCcw, Lock, Image, FileText } from "lucide-react";
import ToolCard from "./ToolCard";

interface ToolGridProps {
  onSelectTool: (tool: string) => void;
}

const tools = [
  {
    id: "merge",
    icon: Merge,
    title: "Merge PDF",
    description: "Combine multiple PDFs into a single document with drag-and-drop reordering.",
    color: "saffron" as const,
  },
  {
    id: "split",
    icon: Scissors,
    title: "Split PDF",
    description: "Extract pages from your PDF into separate individual files.",
    color: "green" as const,
  },
  {
    id: "compress",
    icon: Minimize2,
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality. Perfect for sharing.",
    color: "blue" as const,
    badge: "Coming Soon",
  },
  {
    id: "convert",
    icon: FileOutput,
    title: "Image to PDF",
    description: "Convert JPG, JPEG, and PNG images into a single PDF document.",
    color: "purple" as const,
  },
];

const ToolGrid = ({ onSelectTool }: ToolGridProps) => {
  return (
    <section id="tools" className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            All PDF Tools
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to work with PDFs. Select a tool to get started.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ToolCard
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                color={tool.color}
                onClick={() => onSelectTool(tool.id)}
                disabled={!!tool.badge}
                badge={tool.badge}
              />
            </div>
          ))}
        </div>

        {/* Coming Soon Preview */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            More tools coming soon
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: RotateCcw, label: "Rotate" },
              { icon: Lock, label: "Protect" },
              { icon: Image, label: "PDF to Image" },
              { icon: FileText, label: "OCR" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolGrid;
