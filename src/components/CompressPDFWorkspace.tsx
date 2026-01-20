import { useState, useCallback } from "react";
import { ArrowLeft, Minimize2, Download, Upload, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import ProcessingState from "./ProcessingState";
import { celebrateSuccess } from "@/lib/confetti";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { validateFileMimeType, sanitizeFileName, safeDownload } from "@/lib/security-utils";

interface CompressPDFWorkspaceProps {
  onBack: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const CompressPDFWorkspace = ({ onBack }: CompressPDFWorkspaceProps) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedPdf, setCompressedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompressed, setIsCompressed] = useState(false);

  const compressPdf = async (file: File): Promise<Uint8Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false
    });

    // Get form if exists and try to flatten
    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      fields.forEach(field => {
        try {
          // Flatten form fields by removing their appearance
          field.enableReadOnly();
        } catch (e) {
          // Skip fields that can't be flattened
        }
      });
    } catch (e) {
      // No form in document
    }

    // Remove metadata to reduce size
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // Save with optimization options
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });

    return compressedBytes;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Strict MIME-type validation
    if (!validateFileMimeType(file, "pdf")) {
      toast({
        title: "Security Alert: Invalid file format",
        description: "Only valid PDF files are allowed.",
        variant: "destructive"
      });
      return;
    }
    
    setPdfFile(file);
    setOriginalSize(file.size);
    setIsCompressed(false);
    setCompressedPdf(null);
    setCompressedSize(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false
  });

  const handleCompress = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      const compressed = await compressPdf(pdfFile);
      
      clearInterval(progressInterval);
      setProgress(100);

      setCompressedPdf(compressed);
      setCompressedSize(compressed.length);
      setIsCompressed(true);

      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsProcessing(false);
      
      celebrateSuccess();
      toast({
        title: "Compression Complete!",
        description: `Reduced from ${formatBytes(pdfFile.size)} to ${formatBytes(compressed.length)}`
      });
    } catch (error) {
      console.error("Compression error:", error);
      setIsProcessing(false);
      // Provide user-friendly error message
      const errorMessage = error instanceof Error && error.message.includes("encrypt")
        ? "This PDF is password-protected and cannot be compressed."
        : "File appears to be corrupted or invalid. Please try another file.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!compressedPdf || !pdfFile) return;
    
    const sanitizedName = sanitizeFileName(`compressed_${pdfFile.name}`);
    safeDownload(compressedPdf, sanitizedName, "application/pdf");
  };

  const handleClear = () => {
    setPdfFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressedPdf(null);
    setIsCompressed(false);
  };

  const savingsPercent = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  if (isProcessing) {
    return (
      <ProcessingState
        status="processing"
        message="Compressing PDF..."
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
              <h1 className="text-xl font-bold text-foreground">Compress PDF</h1>
              <p className="text-sm text-muted-foreground">
                Reduce file size while maintaining quality
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
              {isDragActive ? "Drop your PDF here" : "Upload PDF to Compress"}
            </p>
            <p className="text-sm text-muted-foreground">
              Click or drag and drop your PDF file
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            {/* File Info */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-india-blue/10">
                  <Minimize2 className="h-7 w-7 text-india-blue" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground truncate">{sanitizeFileName(pdfFile.name)}</p>
                  <p className="text-sm text-muted-foreground">
                    Original size: {formatBytes(originalSize)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Remove
                </Button>
              </div>

              {/* Size Comparison */}
              {isCompressed && (
                <div className="mb-6 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Before</p>
                      <p className="text-lg font-bold text-foreground">{formatBytes(originalSize)}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4">
                      <TrendingDown className="h-5 w-5 text-india-green" />
                      <span className="text-lg font-bold text-india-green">
                        {savingsPercent > 0 ? `-${savingsPercent}%` : "0%"}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">After</p>
                      <p className="text-lg font-bold text-india-green">{formatBytes(compressedSize)}</p>
                    </div>
                  </div>
                  
                  {/* Visual bar */}
                  <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-india-saffron to-india-green rounded-full transition-all duration-500"
                      style={{ width: `${100 - savingsPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!isCompressed ? (
                  <Button variant="india" className="flex-1 gap-2" onClick={handleCompress}>
                    <Minimize2 className="h-4 w-4" />
                    Compress PDF
                  </Button>
                ) : (
                  <>
                    <Button variant="india" className="flex-1 gap-2" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      Download Compressed
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      New File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Info Note */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Our compression removes metadata and optimizes PDF structure. 
                Results may vary based on original PDF content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPDFWorkspace;
