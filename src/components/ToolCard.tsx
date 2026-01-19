import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "saffron" | "green" | "blue" | "purple";
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

const colorStyles = {
  saffron: {
    bg: "bg-primary/10",
    icon: "text-primary",
    hover: "hover:border-primary/30 hover:bg-primary/5",
    gradient: "from-primary/20 to-primary/5",
  },
  green: {
    bg: "bg-accent/10",
    icon: "text-accent",
    hover: "hover:border-accent/30 hover:bg-accent/5",
    gradient: "from-accent/20 to-accent/5",
  },
  blue: {
    bg: "bg-india-blue/10",
    icon: "text-india-blue",
    hover: "hover:border-india-blue/30 hover:bg-india-blue/5",
    gradient: "from-india-blue/20 to-india-blue/5",
  },
  purple: {
    bg: "bg-purple-500/10",
    icon: "text-purple-500",
    hover: "hover:border-purple-500/30 hover:bg-purple-500/5",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
};

const ToolCard = ({ icon: Icon, title, description, color, onClick, disabled, badge }: ToolCardProps) => {
  const styles = colorStyles[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-card transition-all duration-300",
        styles.hover,
        "hover:shadow-card-hover hover:-translate-y-1",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {/* Badge */}
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110", styles.bg)}>
        <Icon className={cn("h-7 w-7", styles.icon)} />
      </div>

      {/* Content */}
      <div>
        <h3 className="mb-1.5 text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Hover gradient */}
      <div className={cn("pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100", styles.gradient)} />
    </button>
  );
};

export default ToolCard;
