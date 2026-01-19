import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, Plus, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/FileDropzone";
import SortableFileItem from "@/components/SortableFileItem";
import ProcessingState from "@/components/ProcessingState";
import { PDFFile, mergePDFs, downloadBlob, generateId } from "@/lib/pdf-utils";
import { celebrateSuccess } from "@/lib/confetti";

interface MergePDFWorkspaceProps {
  onBack: () => void;
}

const MergePDFWorkspace = ({ onBack }: MergePDFWorkspaceProps) => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesSelected = useCallback((files: File[]) => {
    const newPdfFiles: PDFFile[] = files.map((file) => ({
      id: generateId(),
      file,
    }));
    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((pf) => pf.id !== id));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;

    setStatus("processing");
    setProgress(0);
    setStatusMessage("Merging your PDFs...");

    try {
      const mergedData = await mergePDFs(pdfFiles, setProgress);
      
      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      downloadBlob(mergedData, "merged-document.pdf");
      
      setStatus("success");
      setStatusMessage("Your PDF is ready!");
      celebrateSuccess();

      // Reset after success
      setTimeout(() => {
        setStatus("idle");
        setPdfFiles([]);
      }, 3000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    setPdfFiles([]);
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
              <h1 className="text-xl font-bold text-foreground">Merge PDF</h1>
              <p className="text-sm text-muted-foreground">
                Combine multiple PDFs into one document
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="container py-8">
        {status === "processing" || status === "success" || status === "error" ? (
          <div className="mx-auto max-w-md">
            <ProcessingState
              status={status}
              progress={progress}
              message={statusMessage}
            />
            {(status === "success" || status === "error") && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={handleReset}>
                  {status === "success" ? "Merge More PDFs" : "Try Again"}
                </Button>
              </div>
            )}
          </div>
        ) : pdfFiles.length === 0 ? (
          <div className="mx-auto max-w-2xl">
            <FileDropzone onFilesSelected={handleFilesSelected} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* File List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pdfFiles.map((pf) => pf.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {pdfFiles.map((pdfFile, index) => (
                    <SortableFileItem
                      key={pdfFile.id}
                      id={pdfFile.id}
                      file={pdfFile.file}
                      index={index}
                      onRemove={handleRemoveFile}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={() => document.getElementById("add-more-files")?.click()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add More Files
              </Button>
              <input
                id="add-more-files"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(Array.from(e.target.files));
                    e.target.value = "";
                  }
                }}
              />

              <Button
                variant="india"
                size="xl"
                onClick={handleMerge}
                disabled={pdfFiles.length < 2}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Merge & Download
              </Button>
            </div>

            {pdfFiles.length < 2 && (
              <p className="text-center text-sm text-muted-foreground">
                Add at least 2 PDFs to merge
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MergePDFWorkspace;
