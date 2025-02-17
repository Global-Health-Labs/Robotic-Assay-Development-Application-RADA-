import { ExperimentFilters } from '@/api/experiment.type';
import { getNAATPresets } from '@/api/naat-experiments.api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Experiments from '@/pages/experiments/components/Experiments';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type TabType = 'NAAT' | 'LFA';

export default function ExperimentsPage() {
  const [tabStates, setTabStates] = useState<{ NAAT: ExperimentFilters; LFA: ExperimentFilters }>({
    NAAT: { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], search: '' },
    LFA: { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], search: '' },
  });

  const { data: presets } = useQuery({
    queryKey: ['naat-presets'],
    queryFn: getNAATPresets,
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">New Experiment</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  NAAT Experiments
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/experiments/naat/new">Custom NAAT</Link>
                </DropdownMenuItem>
                {presets && presets.length > 0 && (
                  <>
                    {presets.map((preset) => (
                      <DropdownMenuItem key={preset.id} asChild className="cursor-pointer">
                        <Link to={`/experiments/naat/new?preset=${preset.id}`}>{preset.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-muted-foreground">
                  LFA Experiments
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/experiments/lfa/new">Custom LFA</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
