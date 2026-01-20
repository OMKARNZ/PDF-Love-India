import { useState, useCallback } from "react";
import { ArrowLeft, FileText, Copy, Download, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import ProcessingState from "./ProcessingState";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

interface PDFToTextWorkspaceProps {
  onBack: () => void;
}

const PDFToTextWorkspace = ({ onBack }: PDFToTextWorkspaceProps) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const extractText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
      setProgress(Math.round(((i + 1) / pdf.numPages) * 100));
    }

    return fullText.trim();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setPdfFile(file);
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const text = await extractText(file);
      setExtractedText(text);
      setIsProcessing(false);
      toast({
        title: "Success!",
        description: "Text extracted successfully."
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to extract text from PDF.",
        variant: "destructive"
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pdfFile?.name.replace(".pdf", "")}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Text file saved successfully."
    });
  };

  const handleClear = () => {
    setPdfFile(null);
    setExtractedText("");
  };

  if (isProcessing) {
    return (
      <ProcessingState
        status="processing"
        message="Extracting text..."
        progress={progress}
      />
    );
  }

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
              <h1 className="text-xl font-bold text-foreground">PDF to Text</h1>
              <p className="text-sm text-muted-foreground">
                Extract all text content from PDF files
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {!pdfFile ? (
          <div
            {...getRootProps()}
            className={`mx-auto max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              isDragActive
                ? "border-india-blue bg-india-blue/5"
                : "border-border hover:border-india-blue/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-india-blue/10">
              <Upload className="h-8 w-8 text-india-blue" />
            </div>
            <p className="mb-2 text-lg font-medium text-foreground">
              {isDragActive ? "Drop your PDF here" : "Upload PDF to Extract Text"}
            </p>
            <p className="text-sm text-muted-foreground">
              Click or drag and drop your PDF file
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {/* File Info and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-india-blue/10">
                  <FileText className="h-6 w-6 text-india-blue" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {extractedText.split(/\s+/).length} words extracted
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy All"}
                </Button>
                <Button variant="india" size="sm" onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download .txt
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  New File
                </Button>
              </div>
            </div>

            {/* Extracted Text */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">Extracted Text</p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                  {extractedText}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFToTextWorkspace;
