import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, Shield } from 'lucide-react';

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (keys: { replicate?: string; deepinfra?: string }) => void;
}

export const APIKeyDialog: React.FC<APIKeyDialogProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [keys, setKeys] = useState({
    replicate: '',
    deepinfra: ''
  });

  const handleSave = () => {
    const filteredKeys = Object.entries(keys)
      .filter(([, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    onSave(filteredKeys);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              Your API keys are stored locally and never sent to our servers.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="replicate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="replicate">Replicate</TabsTrigger>
              <TabsTrigger value="deepinfra">DeepInfra</TabsTrigger>
            </TabsList>

            <TabsContent value="replicate" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="replicate-key">Replicate API Key</Label>
                <Input
                  id="replicate-key"
                  type="password"
                  placeholder="r8_..."
                  value={keys.replicate}
                  onChange={(e) => setKeys(prev => ({ ...prev, replicate: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://replicate.com/account/api-tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    replicate.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="deepinfra" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deepinfra-key">DeepInfra API Key</Label>
                <Input
                  id="deepinfra-key"
                  type="password"
                  placeholder="Enter your DeepInfra API key"
                  value={keys.deepinfra}
                  onChange={(e) => setKeys(prev => ({ ...prev, deepinfra: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://deepinfra.com/dash/api_keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    deepinfra.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-primary"
            >
              Save Keys
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};