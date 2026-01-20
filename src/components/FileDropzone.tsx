import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFiles, sanitizeFileName, FileCategory } from "@/lib/security-utils";
import { toast } from "@/hooks/use-toast";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  fileCategory?: FileCategory;
}

const FileDropzone = ({
  onFilesSelected,
  accept = { "application/pdf": [".pdf"] },
  multiple = true,
  maxFiles = 20,
  className,
  fileCategory = "pdf",
}: FileDropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Strict MIME-type validation
      const { validFiles, invalidFiles } = validateFiles(acceptedFiles, fileCategory);

      if (invalidFiles.length > 0) {
        toast({
          title: "Security Alert: Invalid file format",
          description: `Rejected: ${invalidFiles.join(", ")}. Only valid ${fileCategory.toUpperCase()} files are allowed.`,
          variant: "destructive",
        });
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, fileCategory]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
        "hover:border-primary/50 hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/10 scale-[1.02]",
        isDragAccept && "border-accent bg-accent/10",
        isDragReject && "border-destructive bg-destructive/10",
        !isDragActive && "border-border bg-muted/30",
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className={cn(
          "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
          isDragActive ? "gradient-india scale-110" : "bg-primary/10"
        )}
      >
        {isDragActive ? (
          <FileText className="h-10 w-10 text-white" />
        ) : (
          <Upload className="h-10 w-10 text-primary" />
        )}
      </div>

      {/* Text */}
      <div className="space-y-2">
        <p className="text-xl font-semibold text-foreground">
          {isDragActive
            ? isDragReject
              ? "Invalid file type"
              : "Drop your PDFs here"
            : "Drag & drop PDFs here"}
        </p>
        <p className="text-muted-foreground">
          or <span className="text-primary font-medium">click to browse</span>
        </p>
        <p className="text-sm text-muted-foreground/70">
          {multiple ? `Up to ${maxFiles} PDF files` : "Select a PDF file"}
        </p>
      </div>

      {/* Decorative corners */}
      <div className="pointer-events-none absolute inset-4">
        <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
        <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-primary/20 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-primary/20 rounded-br-lg" />
      </div>
    </div>
  );
};

export default FileDropzone;
