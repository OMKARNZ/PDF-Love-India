import { useState, useCallback } from "react";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/FileDropzone";
import ProcessingState from "@/components/ProcessingState";
import { splitPDF, downloadBlob, generateId } from "@/lib/pdf-utils";
import { celebrateSuccess } from "@/lib/confetti";

interface SplitPDFWorkspaceProps {
  onBack: () => void;
}

const SplitPDFWorkspace = ({ onBack }: SplitPDFWorkspaceProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [splitPages, setSplitPages] = useState<{ pageNumber: number; data: Uint8Array }[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSplit = async () => {
    if (!selectedFile) return;

    setStatus("processing");
    setProgress(0);
    setStatusMessage("Splitting your PDF...");

    try {
      const pages = await splitPDF(selectedFile, setProgress);
      
      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setSplitPages(pages);
      setStatus("success");
      setStatusMessage(`Split into ${pages.length} pages!`);
      celebrateSuccess();
    } catch (error) {
      console.error("Split error:", error);
      setStatus("error");
      // Provide user-friendly error message
      const errorMessage = error instanceof Error && error.message.includes("encrypt")
        ? "This PDF is password-protected and cannot be split."
        : "File appears to be corrupted or invalid. Please try again.";
      setStatusMessage(errorMessage);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleDownloadPage = (pageNumber: number) => {
    const page = splitPages.find((p) => p.pageNumber === pageNumber);
    if (page) {
      const baseName = selectedFile?.name.replace(".pdf", "") || "document";
      downloadBlob(page.data, `${baseName}-page-${pageNumber}.pdf`);
    }
  };

  const handleDownloadAll = () => {
    const baseName = selectedFile?.name.replace(".pdf", "") || "document";
    splitPages.forEach((page, index) => {
      setTimeout(() => {
        downloadBlob(page.data, `${baseName}-page-${page.pageNumber}.pdf`);
      }, index * 300);
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSplitPages([]);
    setStatus("idle");
  };

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
              <h1 className="text-xl font-bold text-foreground">Split PDF</h1>
              <p className="text-sm text-muted-foreground">
                Extract pages into separate PDF files
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="container py-8">
        {status === "processing" ? (
          <div className="mx-auto max-w-md">
            <ProcessingState
              status={status}
              progress={progress}
              message={statusMessage}
            />
          </div>
        ) : status === "success" && splitPages.length > 0 ? (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Success Message */}
            <div className="rounded-2xl bg-accent/10 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{statusMessage}</h2>
              <p className="mt-1 text-muted-foreground">
                Download individual pages or all at once
              </p>
            </div>

            {/* Download All Button */}
            <div className="flex justify-center">
              <Button variant="india" size="xl" onClick={handleDownloadAll} className="gap-2">
                <Download className="h-5 w-5" />
                Download All Pages
              </Button>
            </div>

            {/* Individual Pages */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {splitPages.map((page) => (
                <button
                  key={page.pageNumber}
                  onClick={() => handleDownloadPage(page.pageNumber)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-sm font-semibold text-primary">{page.pageNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">Page {page.pageNumber}</p>
                    <p className="text-sm text-muted-foreground">Click to download</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleReset}>
                Split Another PDF
              </Button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="mx-auto max-w-md">
            <ProcessingState
              status={status}
              progress={0}
              message={statusMessage}
            />
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        ) : !selectedFile ? (
          <div className="mx-auto max-w-2xl">
            <FileDropzone onFilesSelected={handleFilesSelected} multiple={false} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Selected File */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Change
              </Button>
            </div>

            {/* Split Button */}
            <div className="flex justify-center">
              <Button variant="india" size="xl" onClick={handleSplit} className="gap-2">
                <Download className="h-5 w-5" />
                Split PDF
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Each page will be extracted as a separate PDF file
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPDFWorkspace;
