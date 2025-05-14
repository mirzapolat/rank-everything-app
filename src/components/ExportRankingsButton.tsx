
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { ImageItem } from "@/types/image";
import { ExportFormat, exportRankingsAsZip } from "@/utils/exportZip";
import { FileArchive } from "lucide-react";

interface ExportRankingsButtonProps {
  images: ImageItem[];
}

const ExportRankingsButton: React.FC<ExportRankingsButtonProps> = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("rank");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (images.length === 0) {
      toast.error("No images to export");
      return;
    }

    try {
      setIsExporting(true);
      await exportRankingsAsZip(images, format);
      toast.success(`Images exported successfully with ${format.toUpperCase()} prefixes`);
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export images");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto"
          disabled={images.length === 0}
        >
          <FileArchive className="mr-2 h-4 w-4" />
          Export as ZIP
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Export Rankings</h4>
          <p className="text-sm text-muted-foreground">
            Export all images as a ZIP file with prefixed filenames.
          </p>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Prefix format:</h5>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rank" id="rank" />
                <label htmlFor="rank" className="text-sm cursor-pointer">
                  Rank (Position number)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="elo" id="elo" />
                <label htmlFor="elo" className="text-sm cursor-pointer">
                  ELO (Rating number)
                </label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportRankingsButton;
