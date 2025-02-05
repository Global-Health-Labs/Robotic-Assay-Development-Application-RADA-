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

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    onUpload(selectedFiles);
    onClose();
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
            accept={['.pdf', '.txt', '.doc', '.docx', '.png', '.jpg', '.jpeg']}
            onChange={handleFileChange}
            onRemove={(file) => {
              setSelectedFiles((prev) => prev.filter((f) => f !== file));
            }}
          >
            <div>User message here</div>
          </MultiFileUploader>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
