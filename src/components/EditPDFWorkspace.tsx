import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Type, PenTool, ImageIcon, Download, Upload, Trash2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import ProcessingState from "./ProcessingState";
import { celebrateSuccess } from "@/lib/confetti";
import { toast } from "@/hooks/use-toast";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

interface EditPDFWorkspaceProps {
  onBack: () => void;
}

interface Annotation {
  id: string;
  type: "text" | "signature" | "image";
  x: number;
  y: number;
  content: string;
  width?: number;
  height?: number;
  fontSize?: number;
  pageIndex: number;
}

const EditPDFWorkspace = ({ onBack }: EditPDFWorkspaceProps) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<"text" | "signature" | "image" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePath, setSignaturePath] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setPdfBytes(arrayBuffer);
      
      // Render PDF pages to images
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];
      
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL("image/png"));
      }
      
      setPageImages(images);
      setCurrentPage(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PDF. Please try again.",
        variant: "destructive"
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false
  });

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !pageContainerRef.current || draggingId) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        setAnnotations(prev => [...prev, {
          id: crypto.randomUUID(),
          type: "text",
          x,
          y,
          content: text,
          fontSize: 14,
          pageIndex: currentPage
        }]);
      }
    }
    
    setSelectedTool(null);
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSignaturePath(`M ${x} ${y}`);
    
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    setSignaturePath(prev => `${prev} L ${x} ${y}`);
  };

  const handleSignatureEnd = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setAnnotations(prev => [...prev, {
      id: crypto.randomUUID(),
      type: "signature",
      x: 10,
      y: 80,
      content: dataUrl,
      width: 150,
      height: 50,
      pageIndex: currentPage
    }]);
    
    // Clear canvas
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSelectedTool(null);
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        setAnnotations(prev => [...prev, {
          id: crypto.randomUUID(),
          type: "image",
          x: 10,
          y: 10,
          content: reader.result as string,
          width: 100,
          height: 100,
          pageIndex: currentPage
        }]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
    setSelectedTool(null);
  };

  const handleAnnotationDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const annotation = annotations.find(a => a.id === id);
    if (!annotation || !pageContainerRef.current) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDraggingId(id);
    setDragOffset({ x: mouseX - annotation.x, y: mouseY - annotation.y });
  };

  const handleAnnotationDrag = (e: React.MouseEvent) => {
    if (!draggingId || !pageContainerRef.current) return;
    
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    
    setAnnotations(prev => prev.map(a => 
      a.id === draggingId ? { ...a, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } : a
    ));
  };

  const handleAnnotationDragEnd = () => {
    setDraggingId(null);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    if (!pdfBytes) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      for (const annotation of annotations) {
        const page = pages[annotation.pageIndex];
        const { width, height } = page.getSize();
        const x = (annotation.x / 100) * width;
        const y = height - (annotation.y / 100) * height;

        if (annotation.type === "text") {
          page.drawText(annotation.content, {
            x,
            y,
            size: annotation.fontSize || 14,
            font,
            color: rgb(0, 0, 0)
          });
        } else if (annotation.type === "signature" || annotation.type === "image") {
          try {
            const imageBytes = await fetch(annotation.content).then(r => r.arrayBuffer());
            const image = await pdfDoc.embedPng(new Uint8Array(imageBytes));
            const scaledWidth = ((annotation.width || 100) / 100) * width;
            const scaledHeight = ((annotation.height || 100) / 100) * height;
            
            page.drawImage(image, {
              x,
              y: y - scaledHeight,
              width: scaledWidth,
              height: scaledHeight
            });
          } catch (e) {
            console.log("Could not embed image:", e);
          }
        }
      }

      clearInterval(progressInterval);
      setProgress(100);

      const editedPdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(editedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited_${pdfFile?.name || "document.pdf"}`;
      link.click();
      URL.revokeObjectURL(url);

      await new Promise(resolve => setTimeout(resolve, 500));
      
      celebrateSuccess();
      toast({
        title: "Success!",
        description: "Your edited PDF has been saved."
      });

      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to save PDF.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (selectedTool === "image") {
      handleImageUpload();
    }
  }, [selectedTool]);

  if (isProcessing) {
    return (
      <ProcessingState
        status="processing"
        message="Saving PDF..."
        progress={progress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Edit PDF</h1>
                <p className="text-sm text-muted-foreground">
                  Add text, signatures, and images
                </p>
              </div>
            </div>
            {pdfFile && (
              <Button variant="india" onClick={handleSave} className="gap-2">
                <Download className="h-4 w-4" />
                Save PDF
              </Button>
            )}
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
                ? "border-india-saffron bg-india-saffron/5"
                : "border-border hover:border-india-saffron/50 hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-india-saffron/10">
              <Upload className="h-8 w-8 text-india-saffron" />
            </div>
            <p className="mb-2 text-lg font-medium text-foreground">
              {isDragActive ? "Drop your PDF here" : "Upload PDF to Edit"}
            </p>
            <p className="text-sm text-muted-foreground">
              Click or drag and drop your PDF file
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Toolbar */}
            <div className="flex lg:flex-col gap-2 bg-card rounded-xl border border-border p-3">
              <Button
                variant={selectedTool === "text" ? "india" : "outline"}
                size="icon"
                onClick={() => setSelectedTool("text")}
                title="Add Text"
              >
                <Type className="h-5 w-5" />
              </Button>
              <Button
                variant={selectedTool === "signature" ? "india" : "outline"}
                size="icon"
                onClick={() => setSelectedTool("signature")}
                title="Add Signature"
              >
                <PenTool className="h-5 w-5" />
              </Button>
              <Button
                variant={selectedTool === "image" ? "india" : "outline"}
                size="icon"
                onClick={() => setSelectedTool("image")}
                title="Add Image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* PDF Preview */}
            <div className="flex-1">
              {/* Page Navigation */}
              {pageImages.length > 1 && (
                <div className="mb-4 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {pageImages.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pageImages.length - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Signature Canvas (shown when signature tool is active) */}
              {selectedTool === "signature" && (
                <div className="mb-4 rounded-xl border border-border bg-white p-4">
                  <p className="mb-2 text-sm text-muted-foreground">Draw your signature below:</p>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="border border-border rounded-lg cursor-crosshair bg-white"
                    onMouseDown={handleSignatureStart}
                    onMouseMove={handleSignatureMove}
                    onMouseUp={handleSignatureEnd}
                    onMouseLeave={handleSignatureEnd}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Release mouse to place signature on page</p>
                </div>
              )}

              {/* PDF Page with Annotations */}
              <div
                ref={pageContainerRef}
                className="relative mx-auto max-w-2xl rounded-xl border border-border overflow-hidden bg-white shadow-lg"
                onClick={handlePageClick}
                onMouseMove={handleAnnotationDrag}
                onMouseUp={handleAnnotationDragEnd}
                onMouseLeave={handleAnnotationDragEnd}
              >
                {pageImages[currentPage] && (
                  <img
                    src={pageImages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full pointer-events-none"
                  />
                )}

                {/* Render Annotations */}
                {annotations
                  .filter(a => a.pageIndex === currentPage)
                  .map(annotation => (
                    <div
                      key={annotation.id}
                      className="absolute group cursor-move"
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                        transform: "translate(0, 0)"
                      }}
                      onMouseDown={(e) => handleAnnotationDragStart(e, annotation.id)}
                    >
                      {annotation.type === "text" && (
                        <div className="flex items-start gap-1">
                          <span 
                            className="text-black whitespace-nowrap bg-white/80 px-1 rounded"
                            style={{ fontSize: annotation.fontSize }}
                          >
                            {annotation.content}
                          </span>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 bg-destructive text-destructive-foreground rounded text-xs"
                            onClick={(e) => { e.stopPropagation(); deleteAnnotation(annotation.id); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {(annotation.type === "signature" || annotation.type === "image") && (
                        <div className="relative">
                          <img
                            src={annotation.content}
                            alt={annotation.type}
                            className="pointer-events-none"
                            style={{
                              width: `${annotation.width}px`,
                              height: `${annotation.height}px`,
                              objectFit: "contain"
                            }}
                          />
                          <button
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-destructive text-destructive-foreground rounded-full"
                            onClick={(e) => { e.stopPropagation(); deleteAnnotation(annotation.id); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Click indicator */}
                {selectedTool === "text" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                      Click anywhere to add text
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPDFWorkspace;
