import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import Footer from "@/components/Footer";
import MergePDFWorkspace from "@/components/MergePDFWorkspace";
import SplitPDFWorkspace from "@/components/SplitPDFWorkspace";
import CompressPDFWorkspace from "@/components/CompressPDFWorkspace";
import ImageToPDFWorkspace from "@/components/ImageToPDFWorkspace";
import ExcelToPDFWorkspace from "@/components/ExcelToPDFWorkspace";
import EditPDFWorkspace from "@/components/EditPDFWorkspace";
import PDFToTextWorkspace from "@/components/PDFToTextWorkspace";
import AIDocumentDoctor from "@/components/AIDocumentDoctor";
import AIChatAssistant from "@/components/AIChatAssistant";
import AISettingsModal from "@/components/AISettingsModal";
import { toast } from "@/hooks/use-toast";

type ActiveTool = "none" | "merge" | "split" | "compress" | "convert" | "excel-to-pdf" | "edit-pdf" | "pdf-to-text" | "ai-doctor";

const Index = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("none");
  const [apiKey, setApiKey] = useState<string>("");
  const [showAISettings, setShowAISettings] = useState(false);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini-api-key", key);
    toast({
      title: "Settings saved",
      description: "Your API key has been saved securely.",
    });
  };

  const handleSelectTool = (tool: string) => {
    if (tool === "ai-doctor" && !apiKey) {
      setShowAISettings(true);
      toast({
        title: "API key required",
        description: "Please configure your Gemini API key to use AI features.",
      });
      return;
    }
    setActiveTool(tool as ActiveTool);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setActiveTool("none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render workspace based on selected tool
  if (activeTool === "merge") {
    return <MergePDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "split") {
    return <SplitPDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "compress") {
    return <CompressPDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "convert") {
    return <ImageToPDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "excel-to-pdf") {
    return <ExcelToPDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "edit-pdf") {
    return <EditPDFWorkspace onBack={handleBack} />;
  }

  if (activeTool === "pdf-to-text") {
    return <PDFToTextWorkspace onBack={handleBack} />;
  }

  if (activeTool === "ai-doctor") {
    return <AIDocumentDoctor onBack={handleBack} apiKey={apiKey} />;
  }

  // Default: Landing page
  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAISettings={() => setShowAISettings(true)} />
      <main>
        <Hero />
        <BentoGrid onSelectTool={handleSelectTool} />
      </main>
      <Footer />
      
      {/* AI Chat Assistant - floating */}
      <AIChatAssistant apiKey={apiKey} />
      
      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
};

export default Index;
