import { FileText, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer id="about" className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-india">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              PDF <span className="text-gradient-india">Love</span> India
            </span>
          </a>

          {/* Description */}
          <p className="max-w-md text-center text-muted-foreground">
            Free, secure, and lightning-fast PDF tools. All processing happens in your browser — 
            your files never leave your device.
          </p>

          {/* Made with love */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 fill-primary text-primary" /> for India
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground/70">
            © {new Date().getFullYear()} PDF Love India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
