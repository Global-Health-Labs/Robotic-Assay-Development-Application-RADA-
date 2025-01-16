import { exportLFAExperiment, useLFAExperiment } from '@/api/lfa-experiments.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3x3, Loader2, Table } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function LFAExperimentExportPage() {
  const { id } = useParams<{ id: string }>();
  const [isExporting, setIsExporting] = useState(false);

  const { data: experiment, isLoading, isError, error } = useLFAExperiment(id!);

  const handleExport = async () => {
    if (!id || isExporting) return;

    setIsExporting(true);
    try {
      const blob = await exportLFAExperiment(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lfa_experiment_${id}_worklist.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Worklist file downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading worklist:', error);
      const errorMessage = error.response?.data?.details || 'Failed to download worklist file';
      const queueLength = error.response?.data?.queueLength || 0;

      if (queueLength > 0) {
        toast.error(`${errorMessage}. Position in queue: ${queueLength}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="mt-2 h-4 w-[300px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-red-500">
          Error loading experiment: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  // Handle case where experiment is undefined
  if (!experiment) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
        <div className="text-muted-foreground">No experiment data found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Experiment</h2>
          <p className="text-muted-foreground">Generate worklist files for {experiment.name}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Experiment Worklist</CardTitle>
            <CardDescription>Download the LFA worklist CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Table className="mr-2 h-4 w-4" />
                  Download CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Robot Instructions</CardTitle>
            <CardDescription>View the robot instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={`/experiments/lfa/${experiment.id}/instructions`} className="w-full">
              <Button className="w-full">
                <Grid3x3 className="mr-2 h-4 w-4" />
                View Instructions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
