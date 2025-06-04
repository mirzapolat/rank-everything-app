
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import ResetDialog from "./ResetDialog";

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  imageCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, imageCount }) => {
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  
  return (
    <header className="py-8 border-b border-paper-tan bg-paper-cream/50">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col gap-6">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setResetDialogOpen(true)}
            className="h-9 w-9 rounded-full border-paper-brown/30 hover:bg-paper-beige"
            aria-label="Reset all data"
          >
            <RotateCcw className="h-4 w-4 text-paper-brown" />
          </Button>
          <ThemeToggle />
        </div>
        
        <div className="text-center">
          <h1 className="magazine-title text-5xl md:text-6xl mb-3 text-ink-black">
            Rank Everything
          </h1>
          <div className="w-24 h-px bg-paper-brown mx-auto mb-4"></div>
          <p className="magazine-subtitle text-lg text-ink-charcoal max-w-2xl mx-auto">
            A sophisticated comparison tool using the Elo rating system to rank your visual preferences
          </p>
        </div>
        
        <div className="flex justify-center">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full max-w-sm">
            <TabsList className="grid grid-cols-2 w-full bg-paper-beige border border-paper-tan h-12">
              <TabsTrigger 
                value="home" 
                className="magazine-body font-medium data-[state=active]:bg-paper-cream data-[state=active]:text-ink-black text-sm px-4 flex items-center justify-center"
              >
                Compare
                {imageCount >= 2 && (
                  <span className="ml-1.5 text-xs bg-teal text-white rounded-full px-1.5 py-0.5">
                    {imageCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="rankings"
                className="magazine-body font-medium data-[state=active]:bg-paper-cream data-[state=active]:text-ink-black text-sm px-4 flex items-center justify-center"
              >
                Results
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <ResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={() => {
          window.dispatchEvent(new CustomEvent('app:reset'));
        }}
      />
    </header>
  );
};

export default Header;
