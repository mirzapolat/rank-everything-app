
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  imageCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, imageCount }) => {
  return (
    <header className="py-6">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col gap-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Rank Everything App
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Compare images head-to-head and rank them using the Elo rating system
          </p>
        </div>
        
        <div className="flex justify-center">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full max-w-md">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="home">
                Home
                {imageCount >= 2 && (
                  <span className="ml-1.5 text-xs bg-teal text-white rounded-full px-1.5 py-0.5">
                    {imageCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  );
};

export default Header;
