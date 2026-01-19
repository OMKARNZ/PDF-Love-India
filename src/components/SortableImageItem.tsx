import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SortableImageItemProps {
  id: string;
  file: File;
  index: number;
  onRemove: (id: string) => void;
}

const SortableImageItem = ({ id, file, index, onRemove }: SortableImageItemProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col items-center rounded-xl border border-border bg-card p-3 transition-all",
        isDragging && "shadow-card-hover opacity-90 z-50 ring-2 ring-primary/30"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Index Badge */}
      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {index + 1}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/90 transition-opacity"
        onClick={() => onRemove(id)}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Image Preview */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted mb-2">
        {preview && (
          <img
            src={preview}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* File Info */}
      <div className="w-full text-center">
        <p className="text-xs font-medium text-foreground truncate px-1">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
};

export default SortableImageItem;
