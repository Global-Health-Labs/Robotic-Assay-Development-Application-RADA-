import { ExperimentWithMastermix } from '@/api/naat-experiments.api';
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
import { getInstructionData } from '@/utils/generateInstructionData';
import { FC, useState } from 'react';
import {
  ExperimentalPlanRow,
  PLATE_LAYOUT_NAME,
  SelectedExperimentalPlanRow,
  SelectedState,
} from './types';

interface Props {
  experiment: ExperimentWithMastermix;
  selectedState: SelectedState;
  onRowClick: (row: SelectedExperimentalPlanRow) => void;
  onPlateWellChange: (wellCount: number) => void;
}

export const SolutionsTable: FC<Props> = ({
  experiment,
  selectedState,
  onRowClick,
  onPlateWellChange,
}) => {
  const [instructionData, setInstructionData] = useState(
    getInstructionData(experiment.mastermixes, [experiment])
  );

  const handleIsDoneChange = (rowId: string, isDone: boolean) => {
    setInstructionData((prevData) =>
      prevData.map((row) => {
        if (row.id === rowId) {
          return { ...row, isDone };
        }
        return row;
      })
    );
  };

  const handleRowClick = (row: ExperimentalPlanRow) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const label =
      (row.well % 8 === 0 ? 'H' : alphabet[(row.well % 8) - 1]) + Math.ceil(row.well / 8);

    // Update plate well count if needed
    if (
      row.plate.trim() === PLATE_LAYOUT_NAME.IVL_384_FLAT_01 ||
      row.plate.trim() === PLATE_LAYOUT_NAME.IVL_384_FLAT_02
    ) {
      onPlateWellChange(384);
    } else {
      onPlateWellChange(96);
    }

    // Call parent's click handler with the row data
    onRowClick({
      ...row,
      wellLabel: label,
    });
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
              key={row.id}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
                selectedState.rowId === row.id &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={() => handleRowClick(row)}
            >
              <TableCell
                className={cn(
                  'border-r font-medium',
                  row.isDone && 'text-muted-foreground',
                  selectedState.rowId === row.id && 'text-primary-foreground'
                )}
              >
                {row.source}
              </TableCell>
              <TableCell
                className={cn(
                  'border-r',
                  row.isDone && 'text-muted-foreground',
                  selectedState.rowId === row.id && 'text-primary-foreground'
                )}
              >
                {row.plate}
              </TableCell>
              <TableCell
                className={cn(
                  'border-r text-center',
                  row.isDone && 'text-muted-foreground',
                  selectedState.rowId === row.id && 'text-primary-foreground'
                )}
              >
                {row.well}
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={row.isDone}
                  onCheckedChange={(checked) => handleIsDoneChange(row.id, checked as boolean)}
                  className={cn(
                    selectedState.rowId === row.id &&
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
