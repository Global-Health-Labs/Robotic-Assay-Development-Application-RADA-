import { Experiment } from '../../api/experiments.api';
export enum PLATE_LAYOUT_NAME {
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

export interface ExperimentalPlanRow {
  id: string;
  source: string;
  totalSourceVolumes: number;
  well: number;
  plate: string;
  isDone: boolean;
}

export interface SelectedState {
  rowId: string;
  solution: string;
  volume: number;
  wellId: number;
  plate: string;
  wellLabel: string;
}

export interface SelectedExperimentalPlanRow extends ExperimentalPlanRow {
  wellLabel: string;
}
