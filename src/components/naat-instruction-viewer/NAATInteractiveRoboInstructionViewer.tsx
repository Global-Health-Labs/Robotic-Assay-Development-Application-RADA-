import { ExperimentWithMastermix } from '@/api/naat-experiments.api';
import { FC, useState } from 'react';
import { NAATDeckLayout } from './DeckLayout';
import { InstructionDetails } from './InstructionDetails';
import { PlateLayout } from './PlateLayout';
import { SolutionsTable } from './SolutionsTable';
import { SelectedExperimentalPlanRow, SelectedState } from './types';
import { plateIdToName } from '@/components/naat-instruction-viewer/plate.util';

interface Props {
  experiment: ExperimentWithMastermix;
}

const NAATInteractiveRoboInstructionViewer: FC<Props> = ({ experiment }) => {
  const [currentPlateWell, setCurrentPlateWell] = useState(96);
  const [selectedCellPosition, setSelectedCellPosition] = useState<DOMRect | null>(null);
  const [selectedState, setSelectedState] = useState<SelectedState>({
    rowId: '',
    solution: '',
    volume: 0,
    wellId: 0,
    plate: '',
    wellLabel: '',
  });

  const handleRowClick = (row: SelectedExperimentalPlanRow) => {
    setSelectedState({
      rowId: row.id,
      solution: row.source,
      volume: row.totalSourceVolumes,
      wellId: row.well,
      plate: row.plate,
      wellLabel: row.wellLabel,
    });
  };

  const selectedPlateName = plateIdToName(selectedState.plate);

  return (
    <div className="flex flex-col">
      <div className="flex gap-4">
        <div className="w-1/3">
          <SolutionsTable
            experiment={experiment}
            selectedState={selectedState}
            onRowClick={handleRowClick}
            onPlateWellChange={setCurrentPlateWell}
          />
        </div>

        <div className="flex w-2/3 flex-col gap-4">
          <div className="relative">
            <PlateLayout
              plateWellCount={currentPlateWell}
              selectedWellId={selectedState.wellId}
              onCellPosition={setSelectedCellPosition}
            />
            <InstructionDetails selectedState={selectedState} cellPosition={selectedCellPosition} />
          </div>
          <NAATDeckLayout deckLayout={experiment.deckLayout} selectedPlate={selectedPlateName} />
        </div>
      </div>
    </div>
  );
};

export default NAATInteractiveRoboInstructionViewer;
