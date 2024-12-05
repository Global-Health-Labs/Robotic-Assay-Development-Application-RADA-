import { Button } from '@/components/ui/button';
import React from 'react';
import { MastermixDetails } from './MastermixDetails';

interface Reagent {
  id: string;
  source: string;
  unit: string;
  finalConcentration: number;
  stockConcentration: number;
  liquidType: string;
}

interface Mastermix {
  id: string;
  name: string;
  reagents: Reagent[];
}

interface MastermixTableProps {
  mastermixes: Mastermix[];
  onChange: (mastermixes: Mastermix[]) => void;
  onValidationChange: (isValid: boolean) => void;
  isSubmitted?: boolean;
}

const CONCENTRATION_UNITS = [
  { value: 'nM', label: 'nM' },
  { value: 'µM', label: 'µM' },
  { value: 'mM', label: 'mM' },
  { value: 'M', label: 'M' },
  { value: 'ng/µL', label: 'ng/µL' },
  { value: 'µg/µL', label: 'µg/µL' },
  { value: 'mg/µL', label: 'mg/µL' },
  { value: 'g/µL', label: 'g/µL' },
  { value: '%', label: '%' },
  { value: 'x', label: 'x' },
];

const LIQUID_TYPES = [
  { value: 'water', label: 'Water' },
  { value: 'buffer', label: 'Buffer' },
  { value: 'enzyme', label: 'Enzyme' },
  { value: 'dye', label: 'Dye' },
  { value: 'primer', label: 'Primer' },
  { value: 'template', label: 'Template' },
  { value: 'other', label: 'Other' },
];

const COLUMN_HEADERS = [
  {
    title: 'Source',
    tooltip:
      'The source is the name of the liquid. Examples of "source" include Water, Polymerase, dNTPs, etc.',
  },
  {
    title: 'Concentration unit',
    tooltip:
      'The concentration unit needs to be the same for both the stock and final concentrations loaded',
  },
  {
    title: 'Final concentration',
    tooltip:
      'The final concentration of each respective reagent in the mastermix. Must be smaller than the stock concentration',
  },
  {
    title: 'Stock concentration',
    tooltip:
      'The starting concentration of each respective reagent in the mastermix. Must be larger than the final concentration',
  },
  {
    title: 'Liquid type',
    tooltip:
      'Liquid classes have been optimized for each liquid type that may be used, from viscous liquids to organics. Select the liquid type that best suits the source reagent',
  },
];

export function MastermixTable({
  mastermixes,
  onChange,
  onValidationChange,
  isSubmitted = false,
}: MastermixTableProps) {
  const [validMastermixes, setValidMastermixes] = React.useState<Set<string>>(new Set());

  const updateMastermix = (updatedMastermix: Mastermix) => {
    // Check if this is a clone operation (new ID)
    const isClone = !mastermixes.find((mm) => mm.id === updatedMastermix.id);

    if (isClone) {
      onChange([...mastermixes, updatedMastermix]);
    } else {
      onChange(mastermixes.map((mm) => (mm.id === updatedMastermix.id ? updatedMastermix : mm)));
    }
  };

  const removeMastermix = (mastermixId: string) => {
    const updatedMastermixes = mastermixes.filter((mm) => mm.id !== mastermixId);
    onChange(updatedMastermixes);
    setValidMastermixes((prev) => {
      const next = new Set(prev);
      next.delete(mastermixId);
      return next;
    });
  };

  // Handle validation status changes for individual mastermixes
  const handleMastermixValidation = (mastermixId: string, isValid: boolean) => {
    setValidMastermixes((prev) => {
      const next = new Set(prev);
      if (isValid) {
        next.add(mastermixId);
      } else {
        next.delete(mastermixId);
      }
      return next;
    });

    // Update overall validation status immediately
    const updatedValidMastermixes = new Set(validMastermixes);
    if (isValid) {
      updatedValidMastermixes.add(mastermixId);
    } else {
      updatedValidMastermixes.delete(mastermixId);
    }
    
    const allValid = mastermixes.every((mm) => 
      mm.id === mastermixId ? isValid : updatedValidMastermixes.has(mm.id)
    );
    onValidationChange(allValid);
  };

  return (
    <div className="space-y-8">
      {mastermixes.map((mastermix) => (
        <MastermixDetails
          key={mastermix.id}
          mastermix={mastermix}
          showValidation={isSubmitted}
          onUpdate={updateMastermix}
          onDelete={() => removeMastermix(mastermix.id)}
          onValidationChange={(isValid) => handleMastermixValidation(mastermix.id, isValid)}
        />
      ))}
    </div>
  );
}
