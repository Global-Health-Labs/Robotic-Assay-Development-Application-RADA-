import { ExperimentWithMastermix } from '@/api/naat-experiments.api';
import { FC, useState } from 'react';
import { SolutionsTable } from './SolutionsTable';
import { PlateLayout } from './PlateLayout';
import { InstructionDetails } from './InstructionDetails';
import { DeckLayout } from './DeckLayout';
import {
  ExperimentalPlanRow,
  PLATE_LAYOUT_NAME,
  SelectedExperimentalPlanRow,
  SelectedState,
} from './types';

// Constants
const LAYOUT_CONTAINER_WIDTH = (window.innerWidth * 2) / 3 - 100;
const LAYOUT_CONTAINER_HEIGHT = 800;
const PLATE_COLOR = '#EEEEEE';
const SELECTED_PLATE_COLOR = '#AAAAAA';
const PLATE_WIDTH = 100;
const PLATE_HEIGHT = 150;
const TIP_START_X = 50;
const TIP_START_Y = 50;
const TIP_GAP = 20;
const TIP_WIDTH = 50;
const TIP_HEIGHT = 50;
const TIP_LOCATIONS = [1, 2, 3, 4, 5];

const plate_sealer_X = TIP_START_X + TIP_WIDTH + TIP_GAP;
const plate_sealer_Y = TIP_START_Y;
const plate_sealer_width = PLATE_WIDTH;
const plate_sealer_height = PLATE_HEIGHT;

enum PLATE_LAYOUT_NAME {
  PLATE_SEALER = 'PLATE_SEALER',
  PCR_PLATE_01 = 'PCR_PLATE_01',
  PCR_PLATE_02 = 'PCR_PLATE_02',
  PCR_PLATE_03 = 'PCR_PLATE_03',
  PCR_PLATE_04 = 'PCR_PLATE_04',
  PCR_PLATE_05 = 'PCR_PLATE_05',
  PCR_PLATE_06 = 'PCR_PLATE_06',
  PCR_COOLER_07 = 'PCR_COOLER_07',
  IVL_384_FLAT_01 = 'IVL_384_FLAT_01',
  IVL_384_FLAT_02 = 'IVL_384_FLAT_02',
}

interface Props {
  experiment: ExperimentWithMastermix;
}

const InteractiveRoboInstructionViewer: FC<Props> = ({ experiment }) => {
  const [selectedRow, setSelectedRow] = useState<SelectedExperimentalPlanRow | null>(null);
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
    setSelectedRow(row);
    setSelectedState({
      rowId: row.id,
      solution: row.source,
      volume: row.totalSourceVolumes,
      wellId: row.well,
      plate: row.plate,
      wellLabel: row.wellLabel,
    });
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
              selectedWellId={selectedState.wellId}
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

export default InteractiveRoboInstructionViewer;
