import { motion } from "framer-motion";
import { FileText, Shield, Sparkles } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onOpenAISettings?: () => void;
}

const Header = ({ onOpenAISettings }: HeaderProps) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass shadow-glass"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-button">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            PDF Love India
          </span>
        </motion.a>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* AI Settings Button */}
          {onOpenAISettings && (
            <motion.button
              onClick={onOpenAISettings}
              className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:shadow-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">AI Settings</span>
            </motion.button>
          )}
          
          {/* Privacy Badge */}
          <motion.div
            className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              100% Private
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
