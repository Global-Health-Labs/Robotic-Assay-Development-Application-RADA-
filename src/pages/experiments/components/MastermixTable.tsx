import React from 'react';
import { MastermixDetails } from './MastermixDetails';
import { Mastermix } from '@/api/naat-experiments.api';

interface MastermixTableProps {
  mastermixes: Mastermix[];
  onChange: (mastermixes: Mastermix[]) => void;
  onValidationChange: (isValid: boolean) => void;
  isSubmitted?: boolean;
}

export function MastermixTable({
  mastermixes,
  onChange,
  onValidationChange,
  isSubmitted = false,
}: MastermixTableProps) {
  const [validMastermixes, setValidMastermixes] = React.useState<Set<string>>(new Set());

  const updateMastermix = React.useCallback(
    (updatedMastermix: Mastermix) => {
      // Check if this is a clone operation (new ID)
      const isClone = !mastermixes.find((mm) => mm.id === updatedMastermix.id);

      if (isClone) {
        onChange([...mastermixes, updatedMastermix]);
      } else {
        onChange(mastermixes.map((mm) => (mm.id === updatedMastermix.id ? updatedMastermix : mm)));
      }
    },
    [mastermixes, onChange]
  );

  const removeMastermix = React.useCallback(
    (mastermixId: string) => {
      const updatedMastermixes = mastermixes.filter((mm) => mm.id !== mastermixId);
      onChange(updatedMastermixes);
      setValidMastermixes((prev) => {
        const next = new Set(prev);
        next.delete(mastermixId);
        return next;
      });
    },
    [mastermixes, onChange]
  );

  // Handle validation status changes for individual mastermixes
  const handleMastermixValidation = React.useCallback((mastermixId: string, isValid: boolean) => {
    setValidMastermixes((prev) => {
      const next = new Set(prev);
      if (isValid) {
        next.add(mastermixId);
      } else {
        next.delete(mastermixId);
      }
      return next;
    });
  }, []);

  // Update overall validation status when validMastermixes changes
  React.useEffect(() => {
    const allValid = mastermixes.every((mm) => validMastermixes.has(mm.id));
    onValidationChange(allValid);
  }, [validMastermixes, mastermixes, onValidationChange]);

  return (
    <div className="space-y-8">
      {mastermixes.map((mastermix) => (
        <MastermixDetails
          key={mastermix.id}
          mastermix={mastermix}
          showValidation={isSubmitted}
          canDelete={mastermixes.length > 1}
          onUpdate={updateMastermix}
          onDelete={() => {
            if (mastermixes.length > 1) {
              removeMastermix(mastermix.id);
            }
          }}
          onValidationChange={handleMastermixValidation}
        />
      ))}
    </div>
  );
}
