import { uploadExperimentFiles } from '@/api/experiment-files.api';
import { Experiment } from '@/api/experiment.type';
import { cloneLFAExperiment } from '@/api/lfa-experiments.api';
import { cloneNAATExperiment } from '@/api/naat-experiments.api';
import { UploadDialog } from '@/components/file-uploader/upload-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Edit2, FileText, Grid3x3, MoreVertical, Upload } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Props {
  experiment: Experiment;
}

export default function ExperimentActions({ experiment }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const cloneExperimentMutation = useMutation({
    mutationFn: () => {
      return (
        experiment.type === 'NAAT'
          ? cloneNAATExperiment(experiment.id)
          : cloneLFAExperiment(experiment.id)
      ) as Promise<Experiment>;
    },
    onSuccess: (clonedExperiment) => {
      toast.success('Experiment cloned successfully');
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      navigate(`/experiments/${clonedExperiment.type.toLowerCase()}/${clonedExperiment.id}/edit`);
    },
    onError: () => {
      toast.error('Failed to clone experiment');
    },
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return uploadExperimentFiles(experiment.id, experiment.type, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-files', experiment.id] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
  });

  const handleClone = () => {
    cloneExperimentMutation.mutate();
  };

  const handleFileUpload = async (files: File[]) => {
    await uploadFilesMutation.mutateAsync(files);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link to={`/experiments/${experiment.type.toLowerCase()}/${experiment.id}/edit`}>
            <DropdownMenuItem className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Experiment
            </DropdownMenuItem>
          </Link>
          <Link to={`/experiments/${experiment.type.toLowerCase()}/${experiment.id}/export`}>
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              Export Worklist Files
            </DropdownMenuItem>
          </Link>
          <Link to={`/experiments/${experiment.type.toLowerCase()}/${experiment.id}/instructions`}>
            <DropdownMenuItem className="cursor-pointer">
              <Grid3x3 className="mr-2 h-4 w-4" />
              View Robot Instructions
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setUploadDialogOpen(true)} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleClone}
            className="cursor-pointer"
            disabled={cloneExperimentMutation.isPending}
          >
            <Copy
              className={cn('mr-2 h-4 w-4', {
                'animate-spin': cloneExperimentMutation.isPending,
              })}
            />
            {cloneExperimentMutation.isPending ? 'Cloning...' : 'Clone Experiment'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleFileUpload}
      />
    </>
  );
}
