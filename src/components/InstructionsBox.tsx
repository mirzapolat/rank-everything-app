
import React, { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const InstructionsBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-8 border border-paper-tan bg-paper-beige/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-paper-beige/50 transition-colors">
          <span className="font-medium text-ink-black">How does this work?</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 text-ink-charcoal ${
              isOpen ? "rotate-180" : ""
            }`} 
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 text-ink-charcoal magazine-body space-y-3">
            <p>
              <strong>Rank Everything</strong> uses the Elo rating system (like chess rankings) to help you discover your visual preferences through simple comparisons.
            </p>
            
            <div className="space-y-2">
              <p><strong>Getting started:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Upload at least 2 images to begin comparing</li>
                <li>Click on the image you prefer, or use keyboard keys <strong>1</strong> or <strong>2</strong></li>
                <li>Each choice updates the ratings of both images</li>
                <li>View your ranked results in the "Results" tab</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <p><strong>Features:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Export your progress to save your rankings</li>
                <li>Import previously saved data to continue where you left off</li>
                <li>Skip pairs if you can't decide between two images</li>
              </ul>
            </div>
            
            <p className="text-sm text-ink-gray">
              The more comparisons you make, the more accurate your rankings become!
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default InstructionsBox;
