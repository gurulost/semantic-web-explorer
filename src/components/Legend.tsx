
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Legend: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm">
          <HelpCircle className="h-4 w-4" />
          <span>How to use</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Semantic Web Explorer</h3>
          
          <div className="space-y-2">
            <h4 className="font-medium">What am I looking at?</h4>
            <p className="text-sm text-muted-foreground">
              This is a 2D visualization of word relationships based on semantic similarity.
              Words that are closer together have similar meanings.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Colors</h4>
            <p className="text-sm text-muted-foreground">
              Words are colored by semantic clusters. Words with the same color
              belong to similar semantic categories.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((cluster) => (
                <div 
                  key={cluster}
                  className={`h-5 w-5 rounded-full cluster-${cluster}`}
                  title={`Cluster ${cluster + 1}`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Interactions</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Mouse wheel to zoom in/out</li>
              <li>Click and drag to pan</li>
              <li>Hover over words to see details</li>
              <li>Click on a word to select it</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Legend;
