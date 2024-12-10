export const PLATE_LAYOUT_NAME = {
  // First section of plate locations
  IVL_96_FLAT_01: 'ivl_96_flat_v1_0001',
  IVL_96_FLAT_02: 'ivl_96_flat_v1_0002',
  IVL_96_DW_01: 'ivl_96_dw_v1_0001',
  IVL_96_DW_02: 'ivl_96_dw_v1_0002',
  IVL_96_FLAT_03: 'ivl_96_flat_v1_0003',

  // Second section of plate locations
  PCR_COOLER_01: 'PCR_onCooler_0001',
  PCR_COOLER_02: 'PCR_onCooler_0002',
  PCR_COOLER_03: 'PCR_onCooler_0003',
  IVL_384_FLAT_01: 'ivl_384_flat_v1_0001',
  IVL_384_FLAT_02: 'ivl_384_flat_v1_0002',

  // Third section of plate locations
  IVL_96_TEMPLATE_01: 'ivl_96_template_v1_0001',
  PCR_COOLER_04: 'PCR_onCooler_0004',
  PCR_COOLER_05: 'PCR_onCooler_0005',
  PCR_COOLER_06: 'PCR_onCooler_0006',
  PCR_COOLER_07: 'PCR_onCooler_0007',
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
