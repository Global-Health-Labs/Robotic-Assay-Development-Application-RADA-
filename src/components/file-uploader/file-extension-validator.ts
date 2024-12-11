import { UseFilePickerConfig } from "node_modules/use-file-picker/dist/interfaces";
import { Validator } from "use-file-picker/validators";

export default class FileExtensionValidator extends Validator {
  constructor(private readonly acceptedFileExtensions: string[]) {
    super();
  }

  validateBeforeParsing(
    _config: UseFilePickerConfig<any>,
    plainFiles: File[]
  ): Promise<void> {
    const fileExtensionErrors = plainFiles.reduce<
      { name: string; reason: string; causedByFile: File }[]
    >((errors, currentFile) => {
      const fileExtension = currentFile.name.split(".").pop();
      if (!fileExtension) {
        return [
          ...errors,
          {
            name: "FileTypeError",
            reason: "FILE_EXTENSION_NOT_FOUND",
            causedByFile: currentFile,
          },
        ];
      }
      const accepted = this.acceptedFileExtensions.map((ext) =>
        ext.toLowerCase()
      );

      if (!accepted.includes(fileExtension.toLowerCase())) {
        return [
          ...errors,
          {
            name: "FileTypeError",
            reason: "FILE_TYPE_NOT_ACCEPTED",
            causedByFile: currentFile,
          },
        ];
      }

      return errors;
    }, []);

    return fileExtensionErrors.length > 0
      ? Promise.reject(fileExtensionErrors)
      : Promise.resolve();
  }

  validateAfterParsing(): Promise<void> {
    return Promise.resolve();
  }
}
