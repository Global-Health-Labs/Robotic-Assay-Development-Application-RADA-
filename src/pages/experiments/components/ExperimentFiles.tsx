import { useQuery } from '@tanstack/react-query';
import { getExperimentFiles, getFileDownloadUrl } from '@/api/experiment-files.api';
import { FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExperimentFilesProps {
  experimentId: string;
  experimentType: 'NAAT' | 'LFA';
}

export function ExperimentFiles({ experimentId, experimentType }: ExperimentFilesProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['experiment-files', experimentId],
    queryFn: () => getExperimentFiles(experimentId),
  });

  const handleDownload = async (fileId: string) => {
    try {
      setIsDownloading(fileId);
      const downloadUrl = await getFileDownloadUrl(experimentId, fileId, experimentType);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return <div>Loading files...</div>;
  }

  if (files.length === 0) {
    return <div>No files uploaded for this experiment.</div>;
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <FileIcon className="h-6 w-6 text-gray-500" />
            <div>
              <p className="font-medium">{file.fileName}</p>
              <p className="text-sm text-gray-500">
                Uploaded on {dayjs(file.uploadedAt).format('MMM DD, YYYY HH:mm')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(file.id)}
            disabled={isDownloading === file.id}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading === file.id ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      ))}
    </div>
  );
}
