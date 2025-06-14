
import { Bot } from "lucide-react";

const Header = () => {
  return (
    <header className="py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-foreground">API Craft</h1>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
