import { PDFDocument } from "pdf-lib";

export interface PDFFile {
  id: string;
  file: File;
}

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
