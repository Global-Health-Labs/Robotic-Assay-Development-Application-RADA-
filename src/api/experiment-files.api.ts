import axios from '@/api/axios';

export interface ExperimentFile {
  id: string;
  experimentId: string;
  fileName: string;
  s3Key: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export async function uploadExperimentFiles(
  experimentId: string,
  experimentType: 'NAAT' | 'LFA',
  files: File[]
): Promise<ExperimentFile[]> {
  const uploadedFiles: ExperimentFile[] = [];

  for (const file of files) {
    // Step 1: Get pre-signed URL from backend
    const { data: presignedData } = await axios.post<PresignedUrlResponse>(
      `/experiments/${experimentId}/files/presign?type=${experimentType}`,
      {
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }
    );

    // Step 2: Upload to S3 using pre-signed URL
    const formData = new FormData();
    Object.entries(presignedData.fields || {}).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    // Create a new axios instance without default headers for S3 upload
    await axios.put(presignedData.url, file, {
      headers: {
        'Content-Type': file.type,
      },
      withCredentials: false,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    // Step 3: Confirm upload with backend
    const { data: fileData } = await axios.post<ExperimentFile>(
      `/experiments/${experimentId}/files?type=${experimentType}`,
      {
        fileName: file.name,
        s3Key: presignedData.key,
        fileSize: file.size,
        contentType: file.type,
      }
    );

    uploadedFiles.push(fileData);
  }

  return uploadedFiles;
}

export async function getExperimentFiles(experimentId: string): Promise<ExperimentFile[]> {
  const { data } = await axios.get<ExperimentFile[]>(`/experiments/${experimentId}/files`);
  return data;
}

export async function deleteExperimentFile(experimentId: string, fileId: string): Promise<void> {
  await axios.delete(`/experiments/${experimentId}/files/${fileId}`);
}

export async function getFileDownloadUrl(
  experimentId: string,
  fileId: string,
  experimentType: 'NAAT' | 'LFA'
): Promise<string> {
  const { data } = await axios.get<{ url: string }>(
    `/experiments/${experimentId}/files/${fileId}/download?type=${experimentType}`
  );
  return data.url;
}
