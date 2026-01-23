import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const AISettingsModal = ({ isOpen, onClose, apiKey, onSaveApiKey }: AISettingsModalProps) => {
  const [inputKey, setInputKey] = useState(apiKey);

  const handleSave = () => {
    onSaveApiKey(inputKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-3xl bg-card p-6 shadow-card-hover">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">AI Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Get a free API key from Google AI Studio
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="ghost" onClick={onClose} className="rounded-full">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="rounded-full">
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AISettingsModal;
