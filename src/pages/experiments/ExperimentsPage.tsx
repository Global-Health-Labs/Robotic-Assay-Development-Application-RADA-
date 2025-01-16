import { ExperimentFilters } from '@/api/experiment.type';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Experiments from '@/pages/experiments/components/Experiments';
import { Link } from 'react-router-dom';

export default function ExperimentsPage() {
  const handleTabChange = (value: string) => {
    // setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    // setFilters((prev: ExperimentFilters) => ({ ...prev }));
  };

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 py-4 md:py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Experiments</h2>
            <p className="text-muted-foreground">Manage and track your experimental plans</p>
          </div>
          <div className="ml-auto flex gap-4">
            <Link to="/experiments/lfa/new">
              <Button variant="outline">New LFA Experiment</Button>
            </Link>
            <Link to="/experiments/naat/new">
              <Button variant="outline">New NAAT Experiment</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="naat" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="relative z-10">
            <TabsTrigger value="naat">NAAT Experiments</TabsTrigger>
            <TabsTrigger value="lfa">LFA Experiments</TabsTrigger>
          </TabsList>
          <TabsContent value="naat">
            <Experiments type="NAAT" />
          </TabsContent>
          <TabsContent value="lfa">
            <Experiments type="LFA" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
