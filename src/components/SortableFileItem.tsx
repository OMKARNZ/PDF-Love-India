import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sanitizeFileName } from "@/lib/security-utils";

interface SortableFileItemProps {
  id: string;
  file: File;
  index: number;
  onRemove: (id: string) => void;
}

const SortableFileItem = ({ id, file, index, onRemove }: SortableFileItemProps) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Sanitize filename for display to prevent XSS
  const displayName = sanitizeFileName(file.name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all",
        isDragging && "shadow-card-hover opacity-90 z-50 ring-2 ring-primary/30"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Index */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
        {index + 1}
      </div>

      {/* File Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SortableFileItem;
