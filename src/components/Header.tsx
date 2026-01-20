import { FileText, Menu, X, Shield } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-india">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            PDF <span className="text-gradient-india">Love</span> India
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#tools" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            All Tools
          </a>
          <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            About
          </a>
          {/* Privacy Badge */}
          <div className="flex items-center gap-2 rounded-full bg-india-green/10 border border-india-green/20 px-4 py-2">
            <Shield className="h-4 w-4 text-india-green" />
            <span className="text-sm font-medium text-india-green">100% Private & Free</span>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-background p-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-4">
            <a
              href="#tools"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              All Tools
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            {/* Privacy Badge - Mobile */}
            <div className="flex items-center justify-center gap-2 rounded-full bg-india-green/10 border border-india-green/20 px-4 py-2">
              <Shield className="h-4 w-4 text-india-green" />
              <span className="text-sm font-medium text-india-green">100% Private & Free</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
