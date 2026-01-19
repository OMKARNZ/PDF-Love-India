import { PDFDocument, PageSizes } from "pdf-lib";

export interface PDFFile {
  id: string;
  file: File;
}

export interface ImageFile {
  id: string;
  file: File;
}

// A4 dimensions in points (72 points per inch)
const A4_PORTRAIT = { width: 595.28, height: 841.89 };
const A4_LANDSCAPE = { width: 841.89, height: 595.28 };

export const mergePDFs = async (
  pdfFiles: PDFFile[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  const totalFiles = pdfFiles.length;

  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i];
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalFiles) * 100));
    }
  }

  return mergedPdf.save();
};

export const splitPDF = async (
  pdfFile: File,
  onProgress?: (progress: number) => void
): Promise<{ pageNumber: number; data: Uint8Array }[]> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pageCount = pdf.getPageCount();
  const splitPages: { pageNumber: number; data: Uint8Array }[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);

    const pdfBytes = await newPdf.save();
    splitPages.push({ pageNumber: i + 1, data: pdfBytes });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / pageCount) * 100));
    }
  }

  return splitPages;
};

export const imagesToPDF = async (
  imageFiles: ImageFile[],
  orientation: "portrait" | "landscape" = "portrait",
  onProgress?: (progress: number) => void
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const pageSize = orientation === "portrait" ? A4_PORTRAIT : A4_LANDSCAPE;
  const totalImages = imageFiles.length;

  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const arrayBuffer = await imageFile.file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Determine image type and embed accordingly
    let image;
    const fileType = imageFile.file.type.toLowerCase();
    
    if (fileType === "image/png") {
      image = await pdfDoc.embedPng(bytes);
    } else {
      // For jpg/jpeg
      image = await pdfDoc.embedJpg(bytes);
    }

    // Calculate scaling to fit within page while maintaining aspect ratio
    const imageWidth = image.width;
    const imageHeight = image.height;
    
    // Add some margin (20 points on each side)
    const margin = 40;
    const maxWidth = pageSize.width - margin * 2;
    const maxHeight = pageSize.height - margin * 2;

    // Calculate scale factor
    const widthScale = maxWidth / imageWidth;
    const heightScale = maxHeight / imageHeight;
    const scale = Math.min(widthScale, heightScale, 1); // Never scale up, only down

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Add a new page
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

    // Center the image on the page
    const x = (pageSize.width - scaledWidth) / 2;
    const y = (pageSize.height - scaledHeight) / 2;

    // Draw the image
    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalImages) * 100));
    }
  }

  return pdfDoc.save();
};

export const downloadBlob = (data: Uint8Array, filename: string) => {
  const blob = new Blob([new Uint8Array(data)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadMultipleAsZip = async (
  files: { filename: string; data: Uint8Array }[]
): Promise<void> => {
  // For simplicity, download each file individually
  // In production, you'd want to use a library like JSZip
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadBlob(file.data, file.filename);
    }, index * 300); // Stagger downloads
  });
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};
