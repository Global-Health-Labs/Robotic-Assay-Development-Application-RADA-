import { NAATExperimentWithMastermix } from '@/api/naat-experiments.api';
import { FC, useState } from 'react';
import { NAATDeckLayout } from './NAATDeckLayout';
import { InstructionDetails } from './InstructionDetails';
import { PlateLayout } from './PlateLayout';
import { SolutionsTable } from './SolutionsTable';
import { SelectedExperimentalPlanRow, SelectedState } from './types';
import { plateIdToName } from '@/components/naat-instruction-viewer/plate.util';

interface Props {
  experiment: NAATExperimentWithMastermix;
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
    <div className="grid grid-cols-12 gap-4">
      {/* Solutions Table - Left Column */}
      <div className="col-span-4">
        <SolutionsTable
          experiment={experiment}
          selectedState={selectedState}
          onRowClick={handleRowClick}
          onPlateWellChange={setCurrentPlateWell}
        />
      </div>

      {/* Plate Layout and Instructions - Middle Column */}
      <div className="col-span-8">
        <div className="flex flex-col gap-4">
          <div className="sticky top-4">
            <PlateLayout
              plateWellCount={currentPlateWell}
              selectedWellId={selectedState.wellId}
              onCellPosition={setSelectedCellPosition}
            />
            <InstructionDetails selectedState={selectedState} cellPosition={selectedCellPosition} />
          </div>

          {/* Deck Layout - Right Column */}
          <div className="sticky top-4">
            <NAATDeckLayout deckLayout={experiment.deckLayout} selectedPlate={selectedPlateName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NAATInteractiveRoboInstructionViewer;
