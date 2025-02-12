import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { size } from 'lodash-es';
import { SelectedFiles } from 'node_modules/use-file-picker/dist/interfaces';
import * as React from 'react';
import { useImperativeFilePicker } from 'use-file-picker';
import { FileSizeValidator } from 'use-file-picker/validators';
import FilePreview from './FilePreview';
import FileCountLimitValidator from './file-count-validator';
import FileExtensionValidator from './file-extension-validator';
import { Eye, XIcon } from 'lucide-react';

interface IMultiFileUploaderProps {
  maxFileSize: number;
  maxNumFiles: number;
  accept: string[];
  children: React.ReactNode;
  selectedFiles?: File[];
  errorMsg?: string;
  disabled?: boolean;
  openOnMount?: boolean;
  onChange: (files: File[]) => void;
  onRemove: (file: File) => void;
}

export const MultiFileUploader: React.FunctionComponent<IMultiFileUploaderProps> = ({
  maxFileSize,
  maxNumFiles = 1,
  accept,
  children,
  selectedFiles = [],
  errorMsg,
  disabled,
  openOnMount,
  onChange,
  onRemove,
}) => {
  const fileCountValidator = React.useRef<FileCountLimitValidator>(
    new FileCountLimitValidator({
      max: maxNumFiles,
    })
  );

  const [validators] = React.useState([
    new FileSizeValidator({
      maxFileSize: maxFileSize * 1024 * 1024,
    }),
    new FileExtensionValidator(accept),
    fileCountValidator.current,
  ]);

  const [showError, setShowError] = React.useState(false);

  const { openFilePicker, errors, removeFileByReference } = useImperativeFilePicker({
    accept: accept.map((type) => `.${type}`).join(','),
    multiple: true,
    validators: validators,
    onFilesSuccessfullySelected: (data: SelectedFiles<ArrayBuffer>) => {
      const numFiles = size(data.plainFiles);
      if (numFiles > 0) {
        handleFileChange(data.plainFiles);
      }
    },
    onClear: () => {
      handleFileChange([]);
    },
  });

  React.useEffect(() => {
    if (openOnMount) {
      openFilePicker();
    }
  }, []);

  React.useEffect(() => {
    fileCountValidator.current.setSelectedFilesCount(size(selectedFiles));
  }, [selectedFiles]);

  React.useEffect(() => {
    if (errors.length > 0) {
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
  }, [errors]);

  const handleFileChange = (files: File[]) => {
    onChange(files);
  };

  const handleRemove = (file: File) => {
    if (!disabled) {
      removeFileByReference(file);
      onRemove(file);
      setShowError(false);
    }
  };

  const formatError = () => {
    if (errors.some((error) => error.name === 'FileTypeError')) {
      return `Invalid file type. Please upload a file with the following extensions: ${accept
        .map((type) => `.${type}`)
        .join(',')}`;
    }

    if (errors.some((error) => error.name === 'FileAmountLimitError')) {
      return `You can select maxiumum of ${maxNumFiles} files only.`;
    }

    if (errors.some((error) => error.name === 'FileSizeError')) {
      return `File size is too large. Please upload a file less than ${maxFileSize}MB.`;
    }

    return 'An error occurred while uploading the file. Please try again.';
  };

  const getFileName = (file: File) => {
    return file.name;
  };

  return (
    <div className="flex flex-col gap-2 overflow-x-hidden">
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full"
        onClick={openFilePicker}
        disabled={disabled}
      >
        {children}
      </Button>

      {errors.length > 0 && showError && (
        <div className="text-sm font-medium text-destructive">{formatError()}</div>
      )}

      {errorMsg && !showError && (
        <div className="text-sm font-medium text-destructive">{errorMsg}</div>
      )}

      {size(selectedFiles) > 0 && (
        <div className="flex flex-col gap-4">
          {selectedFiles.map((doc, index) => (
            <React.Fragment key={`${getFileName(doc)}-${index}`}>
              <div className="flex items-center justify-between rounded-md border bg-primary/5 px-4 py-2">
                <div className={cn('flex w-full flex-nowrap items-center gap-2')}>
                  <div
                    className="flex-1 truncate font-medium text-muted-foreground"
                    title={getFileName(doc)}
                  >
                    {getFileName(doc)}
                  </div>
                  <FilePreview files={[doc]}>
                    <button>
                      <Eye className="size-6 text-muted-foreground" />
                    </button>
                  </FilePreview>

                  {doc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => handleRemove(doc)}
                    >
                      <XIcon className="size-6 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
