import { ArrowLeft, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompressPDFWorkspaceProps {
  onBack: () => void;
}

const CompressPDFWorkspace = ({ onBack }: CompressPDFWorkspaceProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Compress PDF</h1>
              <p className="text-sm text-muted-foreground">
                Reduce file size while maintaining quality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="container py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-india-blue/10">
            <Minimize2 className="h-10 w-10 text-india-blue" />
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-foreground">Coming Soon!</h2>
          <p className="mb-8 text-muted-foreground">
            We're working hard to bring you powerful PDF compression. 
            Reduce file sizes without sacrificing quality — perfect for sharing large documents.
          </p>

          {/* Feature Preview */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 text-left">
            <h3 className="mb-4 font-semibold text-foreground">What to expect:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  Multiple compression levels (Low, Medium, High)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">
                  Preview before & after file sizes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-india-blue" />
                <span className="text-sm text-muted-foreground">
                  100% client-side processing for privacy
                </span>
              </li>
            </ul>
          </div>

          <Button variant="outline" onClick={onBack}>
            Go Back to Tools
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompressPDFWorkspace;
