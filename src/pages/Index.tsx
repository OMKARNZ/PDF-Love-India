import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ToolGrid from "@/components/ToolGrid";
import Footer from "@/components/Footer";
import MergePDFWorkspace from "@/components/MergePDFWorkspace";
import SplitPDFWorkspace from "@/components/SplitPDFWorkspace";
import CompressPDFWorkspace from "@/components/CompressPDFWorkspace";

type ActiveTool = "none" | "merge" | "split" | "compress" | "convert";

const Index = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("none");

  const handleSelectTool = (tool: string) => {
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

  // Default: Landing page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ToolGrid onSelectTool={handleSelectTool} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
