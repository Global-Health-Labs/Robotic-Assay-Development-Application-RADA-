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
import { Loader2, UploadCloud } from 'lucide-react';
import { toUpper } from 'lodash-es';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE = 10; // 10MB

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
      setSelectedFiles([]);
      setIsUploading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>Select files to upload for your experiment.</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 gap-4 overflow-y-auto py-4">
          <MultiFileUploader
            maxNumFiles={10}
            maxFileSize={MAX_FILE_SIZE * 1024 * 1024} // 10MB
            accept={ALLOWED_FILE_TYPES}
            onChange={handleFileChange}
            onRemove={(file) => {
              setSelectedFiles((prev) => prev.filter((f) => f !== file));
            }}
            selectedFiles={selectedFiles}
          >
            <div className="flex w-full items-center justify-between py-3">
              <div className="flex flex-col items-start">
                <span className="text-lg font-medium">
                  {selectedFiles.length > 0 ? `Select Another File` : `Select Document File`}
                </span>
                <span className="text-sm font-thin text-muted-foreground">
                  Max file size - {MAX_FILE_SIZE}MB
                </span>
                <span className="text-sm font-thin text-muted-foreground">
                  Allowed file types - {toUpper(ALLOWED_FILE_TYPES.join(', '))}
                </span>
              </div>
              <UploadCloud size={36} />
            </div>
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
