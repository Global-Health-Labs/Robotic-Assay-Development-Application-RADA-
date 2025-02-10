import {
  getLFAInstructionData,
  LFAExperimentWithDeckLayout,
  LFARoboInstruction,
} from '@/api/lfa-experiments.api';
import { plateIdToName } from '@/components/lfa-instruction-viewer/plate.util';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';

interface Props {
  experiment: LFAExperimentWithDeckLayout;
  selectedState: LFARoboInstruction;
  onRowClick: (row: LFARoboInstruction) => void;
  onPlateWellChange: (wellCount: number) => void;
}

export const SolutionsTable: FC<Props> = ({
  experiment,
  selectedState,
  onRowClick,
  onPlateWellChange,
}) => {
  const [instructionData, setInstructionData] = useState<LFARoboInstruction[]>([]);
  const { data } = useQuery({
    queryKey: ['instructionData', experiment.id],
    queryFn: () => getLFAInstructionData(experiment.id),
    enabled: !!experiment,
  });

  useEffect(() => {
    if (data) {
      setInstructionData(data);
    }
  }, [data]);

  const handleIsDoneChange = (solution: string, isDone: boolean) => {
    setInstructionData((prevData) =>
      prevData.map((row) => {
        if (row.solution === solution) {
          return { ...row, isDone };
        }
        return row;
      })
    );
  };

  const handleRowClick = (row: LFARoboInstruction) => {
    // Update plate well count if needed
    if (row.plateWell.includes('_384_')) {
      onPlateWellChange(384);
    } else {
      onPlateWellChange(96);
    }

    // Call parent's click handler with the row data
    onRowClick(row);
  };

  return (
    <div className="mb-5 ml-3 overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r">Solution</TableHead>
            <TableHead className="border-r">Plate</TableHead>
            <TableHead className="border-r px-1">Well</TableHead>
            <TableHead className="text-center">Done</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructionData.map((row) => (
            <TableRow
              key={row.solution}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
                selectedState.solution === row.solution &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={() => handleRowClick(row)}
            >
              <TableCell
                className={cn(
                  'border-r font-medium',
                  row.isDone && 'text-muted-foreground',
                  selectedState.solution === row.solution && 'text-primary-foreground'
                )}
              >
                {row.solution}
              </TableCell>
              <TableCell
                className={cn(
                  'border-r',
                  row.isDone && 'text-muted-foreground',
                  selectedState.solution === row.solution && 'text-primary-foreground'
                )}
              >
                {plateIdToName(row.plateWell.split('|')[0])}
              </TableCell>
              <TableCell
                className={cn(
                  'border-r text-center',
                  row.isDone && 'text-muted-foreground',
                  selectedState.solution === row.solution && 'text-primary-foreground'
                )}
              >
                {row.userInput}
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={row.isDone}
                  onCheckedChange={(checked) =>
                    handleIsDoneChange(row.solution, checked as boolean)
                  }
                  className={cn(
                    selectedState.solution === row.solution &&
                      'border-primary-foreground text-primary-foreground'
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
