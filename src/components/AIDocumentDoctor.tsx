import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Sparkles, AlertCircle, CheckCircle2, Download, FileText, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { validateFileMimeType, sanitizeFileName, ObjectURLManager } from "@/lib/security-utils";
import * as pdfjsLib from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface AIDocumentDoctorProps {
  onBack: () => void;
  apiKey: string;
}

interface Issue {
  type: "grammar" | "style" | "clarity" | "missing";
  text: string;
  suggestion: string;
}

interface AnalysisResult {
  issues: Issue[];
  improvedContent: string;
  summary: string;
}

const AIDocumentDoctor = ({ onBack, apiKey }: AIDocumentDoctorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const urlManagerRef = useRef(new ObjectURLManager());

  useEffect(() => {
    const manager = urlManagerRef.current;
    return () => manager.revokeAll();
  }, []);

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    if (!validateFileMimeType(pdfFile, ["application/pdf"])) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setFile(pdfFile);
    setIsExtracting(true);
    setAnalysis(null);

    try {
      const text = await extractTextFromPDF(pdfFile);
      setExtractedText(text);
      
      if (text.length < 50) {
        toast({
          title: "Limited text found",
          description: "This PDF may be image-based or have very little text content.",
        });
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      toast({
        title: "Extraction failed",
        description: "Could not extract text from this PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const analyzeWithAI = async () => {
    if (!extractedText || !apiKey) {
      toast({
        title: "Missing requirements",
        description: apiKey ? "No text to analyze." : "Please configure your API key in settings.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze the following document text. Identify:
1. Grammar mistakes
2. Weak phrasing that could be improved
3. Missing information or unclear sections
4. Style inconsistencies

Then provide a professionally rewritten version of the content.

Return your response in this exact JSON format:
{
  "issues": [
    { "type": "grammar|style|clarity|missing", "text": "the problematic text", "suggestion": "how to fix it" }
  ],
  "improvedContent": "The full rewritten, professional version of the document",
  "summary": "A brief 2-3 sentence summary of the main issues found"
}

Document text:
${extractedText.substring(0, 15000)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
        setAnalysis(parsed);
        toast({
          title: "Analysis complete",
          description: `Found ${parsed.issues.length} suggestions for improvement.`,
        });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze the document.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadImprovedPDF = () => {
    if (!analysis?.improvedContent) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(analysis.improvedContent, maxWidth);
    let y = margin;
    const lineHeight = 7;

    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save("improved-document.pdf");
    toast({
      title: "PDF downloaded",
      description: "Your improved document has been saved.",
    });
  };

  const issueTypeConfig = {
    grammar: { color: "text-destructive", bg: "bg-destructive/10", label: "Grammar" },
    style: { color: "text-amber-600", bg: "bg-amber-100", label: "Style" },
    clarity: { color: "text-primary", bg: "bg-primary/10", label: "Clarity" },
    missing: { color: "text-purple-600", bg: "bg-purple-100", label: "Missing" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass shadow-glass sticky top-0 z-50"
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Document Doctor</span>
            </div>
          </div>
          
          {analysis && (
            <Button onClick={downloadImprovedPDF} className="rounded-full gap-2">
              <Download className="h-4 w-4" />
              Download Improved PDF
            </Button>
          )}
        </div>
      </motion.header>

      <main className="container py-12">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-headline font-semibold text-foreground mb-4">
                  Analyze & Improve
                </h1>
                <p className="text-muted-foreground text-lg">
                  Upload a PDF and let AI identify issues and suggest improvements.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`
                  rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer
                  transition-all duration-300 bg-card shadow-card
                  ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {isDragActive ? "Drop your PDF here" : "Drop a PDF or click to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll extract the text and analyze it with AI
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              {/* File info */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{sanitizeFileName(file.name)}</p>
                    <p className="text-sm text-muted-foreground">
                      {extractedText.length.toLocaleString()} characters extracted
                    </p>
                  </div>
                </div>

                {!analysis && !isAnalyzing && (
                  <Button
                    onClick={analyzeWithAI}
                    disabled={isExtracting || !extractedText}
                    className="rounded-full gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze with AI
                  </Button>
                )}
              </div>

              {/* Loading states */}
              {(isExtracting || isAnalyzing) && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-medium">
                    {isExtracting ? "Extracting text..." : "Analyzing with AI..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isExtracting ? "Reading your PDF" : "This may take a moment"}
                  </p>
                </div>
              )}

              {/* Analysis results */}
              {analysis && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Issues panel */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl bg-card p-6 shadow-card"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Issues Found ({analysis.issues.length})
                    </h3>

                    <p className="text-sm text-muted-foreground mb-6">
                      {analysis.summary}
                    </p>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                      {analysis.issues.map((issue, idx) => {
                        const config = issueTypeConfig[issue.type];
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-2xl bg-secondary/50"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              "{issue.text}"
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              → {issue.suggestion}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Improved content panel */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-3xl bg-card p-6 shadow-card"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Improved Version
                    </h3>

                    <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto scrollbar-thin">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {analysis.improvedContent}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AIDocumentDoctor;
