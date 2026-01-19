import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProcessingStateProps {
  status: "idle" | "processing" | "success" | "error";
  progress: number;
  message: string;
  className?: string;
}

const ProcessingState = ({ status, progress, message, className }: ProcessingStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-12", className)}>
      {/* Icon */}
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500",
          status === "processing" && "gradient-india animate-pulse",
          status === "success" && "bg-accent/20",
          status === "error" && "bg-destructive/20"
        )}
      >
        {status === "processing" && (
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        )}
        {status === "success" && (
          <CheckCircle2 className="h-10 w-10 text-accent" />
        )}
        {status === "error" && (
          <XCircle className="h-10 w-10 text-destructive" />
        )}
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-xl font-semibold text-foreground mb-2">{message}</p>
        {status === "processing" && (
          <p className="text-muted-foreground">Please wait while we process your files...</p>
        )}
      </div>

      {/* Progress Bar */}
      {status === "processing" && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-center text-sm text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingState;
