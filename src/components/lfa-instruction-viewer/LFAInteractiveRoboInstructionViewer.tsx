import { LFAExperimentWithDeckLayout, LFARoboInstruction } from '@/api/lfa-experiments.api';
import { last, size, trim } from 'lodash-es';
import { FC, useState } from 'react';
import { InstructionDetails } from './InstructionDetails';
import { PlateLayout } from './PlateLayout';
import { SolutionsTable } from './SolutionsTable';
import { LFADeckLayout } from '@/components/lfa-instruction-viewer/DeckLayout';
import { plateIdToName } from '@/components/lfa-instruction-viewer/plate.util';

interface Props {
  experiment: LFAExperimentWithDeckLayout;
}

const LFAInteractiveRoboInstructionViewer: FC<Props> = ({ experiment }) => {
  const [currentPlateWell, setCurrentPlateWell] = useState(96);
  const [selectedCellPosition, setSelectedCellPosition] = useState<DOMRect | null>(null);
  const [selectedState, setSelectedState] = useState<LFARoboInstruction>({
    solution: '',
    plateWell: '',
    userInput: '',
    isDone: false,
  });

  const handleRowClick = (row: LFARoboInstruction) => {
    setSelectedState({ ...row });
  };

  const [selectedPlate, selectedWellId] = selectedState.plateWell.split('|').map((part, index) => {
    const val = trim(part);
    if (size(val) === 0) {
      return '';
    }

    if (index === 0) {
      return plateIdToName(val);
    }
    return Number(val);
  });

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
              selectedWellId={selectedWellId as number}
              onCellPosition={setSelectedCellPosition}
            />
            <InstructionDetails selectedState={selectedState} cellPosition={selectedCellPosition} />
          </div>
          <LFADeckLayout
            deckLayout={experiment.deckLayout}
            selectedPlate={selectedPlate as string}
          />
        </div>
      </div>
    </div>
  );
};

export default LFAInteractiveRoboInstructionViewer;
