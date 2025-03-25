export const PLATE_LAYOUT_NAME = {
  // First section of plate locations
  IVL_96_FLAT_01: 'dw_96_0001',
  IVL_96_FLAT_02: 'dw_96_0002',
  IVL_96_DW_01: 'dw_96_0001',
  IVL_96_DW_02: 'dw_96_0002',
  IVL_96_FLAT_03: 'dw_96_0003',

  // Second section of plate locations
  PCR_COOLER_01: 'pcr_96_0001',
  PCR_COOLER_02: 'pcr_96_0002',
  PCR_COOLER_03: 'pcr_96_0003',
  IVL_384_FLAT_01: 'dw_384_0001',
  IVL_384_FLAT_02: 'dw_384_0002',

  // Third section of plate locations
  IVL_96_TEMPLATE_01: 'dw_96_0001',
  PCR_COOLER_04: 'pcr_96_0004',
  PCR_COOLER_05: 'pcr_96_0005',
  PCR_COOLER_06: 'pcr_96_0006',
  PCR_COOLER_07: 'pcr_96_0007',
} as const;

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
