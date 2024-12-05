export interface ValidationError {
  field: string;
  message: string;
}

export interface ReagentValidation {
  source?: string;
  unit?: string;
  finalConcentration?: string;
  stockConcentration?: string;
  liquidType?: string;
}

export function validateReagent(reagent: {
  source: string;
  unit: string;
  finalConcentration: number;
  stockConcentration: number;
  liquidType: string;
}): ReagentValidation {
  const errors: ReagentValidation = {};

  if (!reagent.source?.trim()) {
    errors.source = 'Source is required';
  }

  if (!reagent.unit) {
    errors.unit = 'Unit is required';
  }

  if (!reagent.finalConcentration || reagent.finalConcentration <= 0) {
    errors.finalConcentration = 'Final concentration must be greater than 0';
  }

  if (!reagent.stockConcentration || reagent.stockConcentration <= 0) {
    errors.stockConcentration = 'Stock concentration must be greater than 0';
  }

  if (
    reagent.stockConcentration &&
    reagent.finalConcentration &&
    reagent.stockConcentration <= reagent.finalConcentration
  ) {
    errors.stockConcentration = 'Stock concentration must be greater than final concentration';
  }

  if (!reagent.liquidType) {
    errors.liquidType = 'Liquid type is required';
  }

  return errors;
}
