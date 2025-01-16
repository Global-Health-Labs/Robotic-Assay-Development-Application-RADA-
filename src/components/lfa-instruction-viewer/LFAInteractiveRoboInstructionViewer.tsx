import { ExperimentWithMastermix } from '@/api/naat-experiments.api';
import { FC, useState } from 'react';
import { DeckLayout } from './DeckLayout';
import { InstructionDetails } from './InstructionDetails';
import { PlateLayout } from './PlateLayout';
import { SolutionsTable } from './SolutionsTable';
import { SelectedExperimentalPlanRow, NAATRowSelectedState } from './types';
import { LFAExperimentWithPlateConfig, LFARoboInstruction } from '@/api/lfa-experiments.api';
import { last, trim } from 'lodash-es';

interface Props {
  experiment: LFAExperimentWithPlateConfig;
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
              selectedWellId={Number(trim(last(selectedState.plateWell.split('|'))))}
              onCellPosition={setSelectedCellPosition}
            />
            <InstructionDetails selectedState={selectedState} cellPosition={selectedCellPosition} />
          </div>
          <DeckLayout selectedPlate={selectedState.plate} />
        </div>
      </div>
    </div>
  );
};

export default LFAInteractiveRoboInstructionViewer;
