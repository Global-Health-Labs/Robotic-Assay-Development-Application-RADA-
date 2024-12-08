import { LIQUID_TYPE, DISPENSE_TYPE } from "../utils/ExtractLiquidClass";

export const DROPDOWN_OPTIONS = {
  // Different options for Tip Washing of recipe for each mastermix
  TIP_WASHING: ['Yes', 'No'] as const,

  // Different options for concentration unit
  UNITS: [
    'mg/mL',
    'ug/mL',
    'ng/mL',
    'mM',
    'uM',
    'nM',
    'X',
    'U/uL',
    '%'
  ] as const,

  // Different options for PCR plate size
  PCR_PLATE_SIZE: [
    96,
    384
  ] as const,

  // Supported options for dispense type
  DISPENSE_TYPE: [
    DISPENSE_TYPE.JET_EMPTY,
    DISPENSE_TYPE.SURFACE_EMPTY
  ] as const,

  // Supported options for liquid type
  LIQUID_TYPE: [
    LIQUID_TYPE.WATER,
    LIQUID_TYPE.BUFFER,
    LIQUID_TYPE.PRIMER,
    LIQUID_TYPE.ENZYMES,
    LIQUID_TYPE.TEMPLATE,
    LIQUID_TYPE.ORGANICS,
    LIQUID_TYPE.DETERGENT,
    LIQUID_TYPE._20uL_MM
  ] as const
} as const;

// Export types for type safety when using these options
export type TipWashing = typeof DROPDOWN_OPTIONS.TIP_WASHING[number];
export type Unit = typeof DROPDOWN_OPTIONS.UNITS[number];
export type PCRPlateSize = typeof DROPDOWN_OPTIONS.PCR_PLATE_SIZE[number];
export type DispenseTypeOption = typeof DROPDOWN_OPTIONS.DISPENSE_TYPE[number];
export type LiquidTypeOption = typeof DROPDOWN_OPTIONS.LIQUID_TYPE[number];
