import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Experiments from '@/pages/experiments/components/Experiments';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ExperimentFilters } from '@/api/experiment.type';

type TabType = 'NAAT' | 'LFA';

export default function ExperimentsPage() {
  const [tabStates, setTabStates] = useState<{ NAAT: ExperimentFilters; LFA: ExperimentFilters }>({
    NAAT: { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], search: '' },
    LFA: { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], search: '' },
  });

  const handleFilterChange = (tab: TabType, newFilters: Partial<ExperimentFilters>) => {
    setTabStates((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...newFilters,
      },
    }));
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

        <Tabs defaultValue="naat" className="w-full">
          <TabsList className="relative z-10">
            <TabsTrigger value="naat">NAAT Experiments</TabsTrigger>
            <TabsTrigger value="lfa">LFA Experiments</TabsTrigger>
          </TabsList>
          <TabsContent value="naat">
            <Experiments
              type="NAAT"
              initialFilters={tabStates.NAAT}
              onFiltersChange={handleFilterChange}
            />
          </TabsContent>
          <TabsContent value="lfa">
            <Experiments
              type="LFA"
              initialFilters={tabStates.LFA}
              onFiltersChange={handleFilterChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
