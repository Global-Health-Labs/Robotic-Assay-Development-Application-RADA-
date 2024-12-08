// Different options of dispense type that the system supports
export const DISPENSE_TYPE = {
  JET_EMPTY: "Jet_Empty",
  SURFACE_EMPTY: "Surface_Empty"
} as const;

// Different options of liquid type that the system supports
export const LIQUID_TYPE = {
  WATER: 'water',
  BUFFER: 'buffer',
  PRIMER: 'primers',
  ENZYMES: 'enzymes',
  TEMPLATE: 'template',
  ORGANICS: 'organics',
  DETERGENT: 'detergent',
  _20uL_MM: 'mastermix'
} as const;

// Prefer of each liquid class
export const LIQUID_CLASS_PREFIX = "RoboNAAT_tip";

// Different options for Liquid Class of each source in mastermix recipe
export const LIQUID_CLASS = {
  BUFFER_SE_50: 'RoboNAAT_tip50_buffer_SurfaceEmpty',
  BUFFER_SE_300: 'RoboNAAT_tip300_buffer_SurfaceEmpty',
  BUFFER_JE_300: 'RoboNAAT_tip300_buffer_JetEmpty',

  PRIMER_SE_50: 'RoboNAAT_tip50_primers_SurfaceEmpty',
  PRIMER_SE_300: 'RoboNAAT_tip300_primers_SurfaceEmpty',

  ENZYME_SE_50: 'RoboNAAT_tip50_enzymes_SurfaceEmpty',
  ENZYME_SE_300: 'RoboNAAT_tip300_enzymes_SurfaceEmpty',

  WATER_SE_1000: 'RoboNAAT_tip1000_Water_SurfaceEmpty',
  WATER_JE_1000: 'RoboNAAT_tip1000_water_JetEmpty',

  TEMPLATE_SE_50: 'RoboNAAT_tip50_template_SurfaceEmpty',

  ORGANIC_SE_50: 'RoboNAAT_tip50_organics_SurfaceEmpty',

  DETERGENT_SE_50: 'RoboNAAT_tip50_detergent_SurfaceEmpty',

  _20uL_MM_JE_300: 'RoboNAAT_tip300_20uL_MM__JetEmpty_Part'
} as const;

export type DispenseType = typeof DISPENSE_TYPE[keyof typeof DISPENSE_TYPE];
export type LiquidType = typeof LIQUID_TYPE[keyof typeof LIQUID_TYPE];

interface TipTypeResult {
  tip: number;
  maxVolume: number;
  unknownTip: boolean;
}

/**
 * Returns appropriate liquid class based on liquid type, dispense type and tip type.
 */
export const getLiquidClass = (
  liquidType: string,
  dispenseType: string,
  tipType: number
): string => {
  if (liquidType.toLowerCase() === LIQUID_TYPE._20uL_MM) {
    return LIQUID_CLASS_PREFIX + '300_20uL_MM__JetEmpty_Part';
  }

  return LIQUID_CLASS_PREFIX + tipType + '_' + liquidType + '_' + dispenseType.replace(/_/, '');
};

/**
 * Gets tip type based on the liquid type, dispense type and volume calculated from user input data.
 * @param liquidType Liquid type retrieved from dropdown option on UI
 * @param volume_uL source volume
 * @returns TipTypeResult object. tip: -1 means volume requires split
 */
export const getTipType = (
  liquidType: string,
  volume_uL: number
): TipTypeResult => {
  const result: TipTypeResult = {
    tip: -1,
    maxVolume: 0,
    unknownTip: false
  };

  // Water liquid type
  if (liquidType.trim().toLowerCase() === LIQUID_TYPE.WATER) {
    result.maxVolume = 1000;
    result.tip = 1000;
  } else { // All other liquid type
    result.maxVolume = 1000;
    if (volume_uL < 50) {
      result.tip = 50;
    } else if (volume_uL >= 50 && volume_uL < 300) {
      result.tip = 300;
    } else {
      result.tip = 1000;
    }
  }
  
  return result;
};
