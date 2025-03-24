interface DefaultValue {
  COLUMN_B: number;
  COLUMN_C: number;
  COLUMN_F: number;
  COLUMN_H: number;
  COLUMN_I: number;
  COLUMN_K: number;
  COLUMN_L: number;
  COLUMN_M: string;
  COLUMN_Q: number;
  COLUMN_R: string;
}

interface AliquotingMM {
  getLiquidClass: (liquidType: string) => string;
  SOURCE: string;
  ASP_MIXING: number;
  DISPENSE_TYPE: string;
  TIP_TYPE: number;
  FROM_PLATE: string;
}

interface MixMM {
  getLiquidClass: (liquidType: string) => string;
  SOURCE: string;
  ASP_MIXING: number;
  DISPENSE_TYPE: string;
  TIP_TYPE: number;
  TO_PLATE: string;
  FROM_PLATE: string;
}

interface SampleMM {
  STEP: string;
  LIQUID_CLASS: string;
  ASP_MIXING: number;
  DISPENSE_TYPE: string;
  TIP_TYPE: number;
  FROM_PLATE: string;
}

/**
 * This contains the default values that will be used in the worklist output file.
 */
export const VALUE: DefaultValue = {
  COLUMN_B: 0, // dx
  COLUMN_C: 0, // dz
  COLUMN_F: 0, // timer_delta
  COLUMN_H: 0, // step_index
  COLUMN_I: 0, // destination,
  COLUMN_K: 0, // time_group_check
  COLUMN_L: 1, // guid
  COLUMN_M: 'some path',
  COLUMN_Q: -1, // touchoff_dis
  COLUMN_R: 'dw_96_0002',
  // COLUMN_R: 'ivl_96_dw_v1_0002',
};

// Default values during aliquoting mastermix step
export const ALIQUOTING_MM: AliquotingMM = {
  getLiquidClass: (liquidType: string) => `RoboNAAT_HighVolume_${liquidType}_DispenseSurface_Empty`,
  SOURCE: 'MM_aq',
  ASP_MIXING: 0,
  DISPENSE_TYPE: 'Jet_Empty',
  TIP_TYPE: 300,
  FROM_PLATE: 'dw_96_0002',
  // FROM_PLATE: 'ivl_96_dw_v1_0002',
};

// Default values during mixing mastermix step
export const MIX_MM: MixMM = {
  getLiquidClass: (liquidType: string) => `RoboNAAT_HighVolume_${liquidType}_DispenseSurface_Empty`,
  SOURCE: 'mixing',
  ASP_MIXING: 10,
  DISPENSE_TYPE: 'Surface_Empty',
  TIP_TYPE: 1000,
  TO_PLATE: 'dw_96_0002',
  FROM_PLATE: 'dw_96_0002',
  // TO_PLATE: 'ivl_96_dw_v1_0002',
  // FROM_PLATE: 'ivl_96_dw_v1_0002',
};

// Default values for sample worklist
export const SAMPLE_MM: SampleMM = {
  STEP: 'template',
  LIQUID_CLASS: 'RoboNAAT_tip50_template_SurfaceEmpty',
  ASP_MIXING: 0,
  DISPENSE_TYPE: 'Surface_Empty',
  TIP_TYPE: 50,
  FROM_PLATE: 'pcr_96_0001',
  // FROM_PLATE: 'ivl_96_template_v1_0001',
};
