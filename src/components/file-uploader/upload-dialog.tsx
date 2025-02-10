import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiFileUploader } from './multi-file-uploader';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      await onUpload(selectedFiles);
      onClose();
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select files to upload for your experiment. Supported formats: .txt
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <MultiFileUploader
            maxNumFiles={10}
            maxFileSize={10 * 1024 * 1024} // 10MB
            accept={['pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg']}
            onChange={handleFileChange}
            onRemove={(file) => {
              setSelectedFiles((prev) => prev.filter((f) => f !== file));
            }}
          >
            <div>User message here</div>
          </MultiFileUploader>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
