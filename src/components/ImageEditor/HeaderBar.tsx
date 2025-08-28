import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, Save, Download, Sparkles } from 'lucide-react';

interface HeaderBarProps {
  onImageUpload: (file: File) => void;
  onSave: () => void;
  onExport: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onImageUpload,
  onSave,
  onExport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="h-16 bg-panel-bg border-b border-panel-border px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Image Editor
          </h1>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="transition-smooth hover:shadow-glow-accent"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>

        <Button
          variant="secondary"
          onClick={onSave}
          className="transition-smooth hover:shadow-glow-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>

        <Button
          variant="default"
          onClick={onExport}
          className="bg-gradient-primary hover:shadow-glow-primary transition-smooth"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </motion.header>
  );
};