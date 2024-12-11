import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { size } from 'lodash-es';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

interface IFilePreviewProps {
  files: File[];
  children: React.ReactNode;
}

type FileForPreview = {
  file: File;
  type: 'image' | 'pdf' | 'unknown';
  url: string;
};

function getFileType(file: File) {
  if (file) {
    const extension = file.name.split('.').pop();
    if (extension) {
      if (extension.toLowerCase() === 'pdf') {
        return 'pdf';
      } else {
        return 'image';
      }
    }
  }
  return 'unknown';
}

function getFileUrl(file: File) {
  if (!file) {
    return '';
  } else if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  // TODO hadle s3 files
  return '';
}

function createFilesForPreview(files: File[]): FileForPreview[] {
  return files.map((file) => {
    const type = getFileType(file);
    const url = getFileUrl(file);
    return {
      file,
      type,
      url,
    };
  });
}

const FilePreview: React.FunctionComponent<IFilePreviewProps> = ({ files, children }) => {
  const [open, setOpen] = React.useState(false);
  const [currentFileIndex, setCurrentFileIndex] = React.useState<number>(0);
  const [previewFiles, setPreviewFiles] = React.useState<FileForPreview[]>([]);

  const showNavigation = size(previewFiles) > 1;

  React.useEffect(() => {
    if (open) {
      if (size(files) === 0) {
        setOpen(false);
      } else {
        setPreviewFiles(createFilesForPreview(files));
      }
    }
  }, [open, files]);

  const isImageFile = previewFiles[currentFileIndex]?.type === 'image';
  const isPdfFile = previewFiles[currentFileIndex]?.type === 'pdf';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer" asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="h-dvh w-dvw max-w-full pt-16 lg:h-[90dvh] lg:w-[90dvw]">
        <div className="relative h-full w-full">
          <div className="flex h-full w-full items-center justify-center">
            {isImageFile && (
              <img
                src={previewFiles[currentFileIndex].url}
                alt="Preview"
                className="h-full object-contain"
              />
            )}
            {isPdfFile && (
              <iframe src={previewFiles[currentFileIndex].url} className="h-full w-full" />
            )}
            {previewFiles[currentFileIndex]?.type === 'unknown' && (
              <div className="h-full w-5/6 bg-primary/20"></div>
            )}
          </div>

          {showNavigation && (
            <div className="absolute left-0 top-1/2 translate-y-1/2">
              <button
                onClick={() => setCurrentFileIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentFileIndex === 0}
                className="rounded-full bg-primary text-white opacity-90 hover:opacity-100 disabled:pointer-events-none disabled:bg-transparent disabled:text-muted-foreground disabled:opacity-60"
              >
                <ChevronLeft className="size-16" />
              </button>
            </div>
          )}
          {showNavigation && (
            <div className="absolute right-0 top-1/2 translate-y-1/2">
              <button
                onClick={() =>
                  setCurrentFileIndex((prev) => Math.min(prev + 1, size(previewFiles) - 1))
                }
                disabled={currentFileIndex === size(previewFiles) - 1}
                className={cn(
                  'rounded-full bg-primary text-white opacity-90 hover:opacity-100 disabled:pointer-events-none disabled:bg-transparent disabled:text-muted-foreground disabled:opacity-60'
                )}
              >
                <ChevronRight className="size-16" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
