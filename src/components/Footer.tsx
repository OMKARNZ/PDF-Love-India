import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 border-t border-border"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 PDF Love India - 100% Private & Secure
          </p>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your files never leave your browser</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
