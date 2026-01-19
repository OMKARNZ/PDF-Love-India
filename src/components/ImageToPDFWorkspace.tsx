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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, Plus, Download, MonitorSmartphone, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ImageDropzone from "@/components/ImageDropzone";
import SortableImageItem from "@/components/SortableImageItem";
import ProcessingState from "@/components/ProcessingState";
import { ImageFile, imagesToPDF, downloadBlob, generateId } from "@/lib/pdf-utils";
import { celebrateSuccess } from "@/lib/confetti";
import { toast } from "@/hooks/use-toast";

interface ImageToPDFWorkspaceProps {
  onBack: () => void;
}

const ImageToPDFWorkspace = ({ onBack }: ImageToPDFWorkspaceProps) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
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
    const newImageFiles: ImageFile[] = files.map((file) => ({
      id: generateId(),
      file,
    }));
    setImageFiles((prev) => [...prev, ...newImageFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setImageFiles((prev) => prev.filter((imgFile) => imgFile.id !== id));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImageFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConvert = async () => {
    if (imageFiles.length === 0) return;

    setStatus("processing");
    setProgress(0);
    setStatusMessage("Converting images to PDF...");

    try {
      const pdfData = await imagesToPDF(imageFiles, orientation, setProgress);

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      downloadBlob(pdfData, "images-to-pdf.pdf");

      setStatus("success");
      setStatusMessage("Your PDF is ready!");
      celebrateSuccess();

      toast({
        title: "Success! 🎉",
        description: "Your images have been converted to PDF and downloaded.",
      });

      // Reset after success
      setTimeout(() => {
        setStatus("idle");
        setImageFiles([]);
      }, 3000);
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setStatusMessage("Something went wrong. Please try again.");
      
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your images. Please try again.",
        variant: "destructive",
      });
      
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    setImageFiles([]);
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
              <h1 className="text-xl font-bold text-foreground">Image to PDF</h1>
              <p className="text-sm text-muted-foreground">
                Convert JPG, JPEG, and PNG images to PDF
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
                  {status === "success" ? "Convert More Images" : "Try Again"}
                </Button>
              </div>
            )}
          </div>
        ) : imageFiles.length === 0 ? (
          <div className="mx-auto max-w-2xl">
            <ImageDropzone onFilesSelected={handleFilesSelected} />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Orientation Toggle */}
            <div className="flex items-center justify-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="orientation" className="text-sm font-medium">
                  Portrait
                </Label>
              </div>
              <Switch
                id="orientation"
                checked={orientation === "landscape"}
                onCheckedChange={(checked) =>
                  setOrientation(checked ? "landscape" : "portrait")
                }
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="orientation" className="text-sm font-medium">
                  Landscape
                </Label>
                <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Image Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={imageFiles.map((imgFile) => imgFile.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {imageFiles.map((imageFile, index) => (
                    <SortableImageItem
                      key={imageFile.id}
                      id={imageFile.id}
                      file={imageFile.file}
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
                onClick={() => document.getElementById("add-more-images")?.click()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add More Images
              </Button>
              <input
                id="add-more-images"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png"
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
                onClick={handleConvert}
                disabled={imageFiles.length === 0}
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Convert to PDF
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} • Drag to reorder • {orientation === "portrait" ? "Portrait" : "Landscape"} mode
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToPDFWorkspace;
