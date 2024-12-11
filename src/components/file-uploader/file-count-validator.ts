import {
  FileAmountLimitError,
  UseFilePickerConfig,
} from "node_modules/use-file-picker/dist/interfaces";
import { Validator } from "use-file-picker/validators";

export interface FileCountLimitConfig {
  min?: number;
  max?: number;
}

class FileCountLimitValidator extends Validator {
  previousNumFiles = 0;
  constructor(private limitFilesConfig: FileCountLimitConfig) {
    super();
  }

  setSelectedFilesCount(numFiles: number) {
    this.previousNumFiles = numFiles;
  }

  onClear(): void {}

  onFileRemoved(): void {}

  validateBeforeParsing(
    _config: UseFilePickerConfig,
    plainFiles: File[]
  ): Promise<void> {
    const fileAmount = this.previousNumFiles + plainFiles.length;
    const { min, max } = this.limitFilesConfig;
    if (max && fileAmount > max) {
      return Promise.reject({
        name: "FileAmountLimitError",
        reason: "MAX_AMOUNT_OF_FILES_EXCEEDED",
      } as FileAmountLimitError);
    }

    if (min && fileAmount < min) {
      return Promise.reject({
        name: "FileAmountLimitError",
        reason: "MIN_AMOUNT_OF_FILES_NOT_REACHED",
      } as FileAmountLimitError);
    }

    return Promise.resolve();
  }

  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}

export default FileCountLimitValidator;
