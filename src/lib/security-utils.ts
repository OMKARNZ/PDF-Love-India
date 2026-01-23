/**
 * Security utilities for PDF Love India
 * Provides file validation, sanitization, and memory management
 */

// Valid MIME types for different file categories
const VALID_PDF_TYPES = ['application/pdf'];
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const VALID_EXCEL_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

export type FileCategory = 'pdf' | 'image' | 'excel';

/**
 * Validates a file's MIME type against allowed types
 * @param file - The file to validate
 * @param category - The expected file category or array of MIME types
 * @returns true if valid, false otherwise
 */
export const validateFileMimeType = (file: File, category: FileCategory | string[]): boolean => {
  const mimeType = file.type.toLowerCase();
  
  // Handle array of MIME types directly
  if (Array.isArray(category)) {
    return category.map(t => t.toLowerCase()).includes(mimeType);
  }
  
  switch (category) {
    case 'pdf':
      return VALID_PDF_TYPES.includes(mimeType);
    case 'image':
      return VALID_IMAGE_TYPES.includes(mimeType);
    case 'excel':
      return VALID_EXCEL_TYPES.includes(mimeType);
    default:
      return false;
  }
};

/**
 * Validates multiple files and returns only valid ones
 * @param files - Array of files to validate
 * @param category - The expected file category
 * @returns Object with valid files and invalid file names
 */
export const validateFiles = (
  files: File[],
  category: FileCategory
): { validFiles: File[]; invalidFiles: string[] } => {
  const validFiles: File[] = [];
  const invalidFiles: string[] = [];

  files.forEach((file) => {
    if (validateFileMimeType(file, category)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(sanitizeFileName(file.name));
    }
  });

  return { validFiles, invalidFiles };
};

/**
 * Sanitizes a filename to prevent XSS and DOM injection attacks
 * Removes or escapes potentially dangerous characters
 * @param fileName - The original filename
 * @returns Sanitized filename safe for display
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed-file';
  }

  // Remove or replace dangerous characters
  // Allow: alphanumeric, dots, hyphens, underscores, spaces
  // Remove: < > " ' ` / \ & # ; = ( ) { } [ ] | ^ $ % @ ! ?
  const sanitized = fileName
    .replace(/[<>"'`/\\&#;=(){}[\]|^$%@!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length to prevent overflow attacks
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop() || '';
    const baseName = sanitized.slice(0, maxLength - ext.length - 1);
    return `${baseName}.${ext}`;
  }

  return sanitized || 'unnamed-file';
};

/**
 * Class to manage Object URLs and prevent memory leaks
 * Tracks created URLs and provides cleanup functionality
 */
export class ObjectURLManager {
  private urls: Set<string> = new Set();

  /**
   * Creates an object URL and tracks it for cleanup
   */
  create(blob: Blob | File): string {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  /**
   * Revokes a specific URL and removes it from tracking
   */
  revoke(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  /**
   * Revokes all tracked URLs - call on component unmount
   */
  revokeAll(): void {
    this.urls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.urls.clear();
  }

  /**
   * Get count of active URLs (for debugging)
   */
  get activeCount(): number {
    return this.urls.size;
  }
}

/**
 * Creates a singleton instance for global URL management
 */
let globalURLManager: ObjectURLManager | null = null;

export const getGlobalURLManager = (): ObjectURLManager => {
  if (!globalURLManager) {
    globalURLManager = new ObjectURLManager();
  }
  return globalURLManager;
};

/**
 * Safe wrapper for PDF processing operations
 * Catches errors and provides user-friendly messages
 */
export const safePDFOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage = 'File appears to be corrupted or invalid'
): Promise<{ success: true; data: T } | { success: false; error: string }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error('PDF operation failed:', error);
    
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('encrypt') || error.message.includes('password')) {
        return { success: false, error: 'This PDF is password-protected and cannot be processed.' };
      }
      if (error.message.includes('Invalid PDF') || error.message.includes('parse')) {
        return { success: false, error: 'This file does not appear to be a valid PDF.' };
      }
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Safe download function with proper cleanup
 */
export const safeDownload = (data: Uint8Array | ArrayBuffer | number[], filename: string, mimeType = 'application/pdf'): void => {
  const sanitizedFilename = sanitizeFileName(filename);
  // Convert to plain array to avoid TypeScript issues with Uint8Array
  const blobData = data instanceof ArrayBuffer ? data : new Uint8Array(data).buffer;
  const blob = new Blob([blobData], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Always revoke the URL, even if download fails
    URL.revokeObjectURL(url);
  }
};
