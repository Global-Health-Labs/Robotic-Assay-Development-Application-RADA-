import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Copy, Menu, Trash2 } from 'lucide-react';
import React from 'react';
import { ReagentDetails } from './ReagentDetails';
import { ReagentValidation, validateReagent } from './ValidationSchema';

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

interface MastermixDetailsProps {
  mastermix: Mastermix;
  showValidation: boolean;
  onUpdate: (mastermix: Mastermix) => void;
  onDelete: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

const COLUMN_HEADERS = [
  {
    title: 'Source',
    tooltip:
      'The source is the name of the liquid. Examples of “source” include Water, Polymerase, dNTPs, etc.',
  },
  {
    title: 'Concentration unit',
    tooltip:
      'The concentration unit needs to be the same for both the stock and final concentrations loaded',
  },
  {
    title: 'Final Concentration',
    tooltip:
      'The final concentration of each respective reagent in the mastermix. Must be smaller than the stock concentration',
  },
  {
    title: 'Stock Concentration',
    tooltip:
      'The starting concentration of each respective reagent in the mastermix. Must be larger than the final concentration',
  },
  {
    title: 'Liquid Type',
    tooltip:
      'Liquid classes have been optimized for each liquid type that may be used, from viscous liquids to organics. Select the liquid type that best suits the source reagent',
  },
];

export function MastermixDetails({
  mastermix,
  onUpdate,
  onDelete,
  onValidationChange,
  showValidation,
}: MastermixDetailsProps) {
  const [validationErrors, setValidationErrors] = React.useState<Record<string, ReagentValidation>>(
    {}
  );

  const validateMastermix = React.useCallback(() => {
    const errors: Record<string, ReagentValidation> = {};
    let hasErrors = false;

    mastermix.reagents.forEach((reagent) => {
      const reagentErrors = validateReagent(reagent);
      if (Object.keys(reagentErrors).length > 0) {
        errors[reagent.id] = reagentErrors;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    onValidationChange?.(!hasErrors);
    return !hasErrors;
  }, [mastermix.reagents, onValidationChange]);

  // Validate on mount and when reagents change if showValidation is true
  React.useEffect(() => {
    if (showValidation) {
      validateMastermix();
    }
  }, [validateMastermix, showValidation]);

  const handleFieldBlur = () => {
    validateMastermix();
  };

  const updateReagent = (reagentId: string, field: keyof Reagent, value: string | number) => {
    const updatedMastermix = {
      ...mastermix,
      reagents: mastermix.reagents.map((r) => (r.id === reagentId ? { ...r, [field]: value } : r)),
    };
    onUpdate(updatedMastermix);
  };

  const removeReagent = (reagentId: string) => {
    if (mastermix.reagents.length > 1) {
      const updatedMastermix = {
        ...mastermix,
        reagents: mastermix.reagents.filter((r) => r.id !== reagentId),
      };
      
      // Clean up validation state for removed reagent
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[reagentId];
        return next;
      });

      // Update mastermix and trigger validation
      onUpdate(updatedMastermix);
      onValidationChange?.(true); // Since we're removing an invalid reagent, the form should now be valid
    }
  };

  const cloneReagent = (reagent: Reagent) => {
    const newReagent: Reagent = {
      ...reagent,
      id: crypto.randomUUID(),
    };

    const updatedMastermix = {
      ...mastermix,
      reagents: [...mastermix.reagents, newReagent],
    };
    onUpdate(updatedMastermix);
  };

  const cloneMastermix = () => {
    const clonedReagents = mastermix.reagents.map((reagent) => ({
      ...reagent,
      id: crypto.randomUUID(),
    }));

    const newMastermix: Mastermix = {
      ...mastermix,
      id: crypto.randomUUID(),
      name: `${mastermix.name} (Copy)`,
      reagents: clonedReagents,
    };

    // Since we can't directly add a new mastermix from this component,
    // we'll emit it through onUpdate and let the parent handle it
    onUpdate(newMastermix);
  };

  return (
    <div className="mastermix-container space-y-4 rounded-lg border border-zinc-200 shadow">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-2 bg-sky-50 px-4 py-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">Mastermix Name</p>
            <div className="flex gap-2">
              <Input
                id={mastermix.id}
                value={mastermix.name}
                onChange={(e) => onUpdate({ ...mastermix, name: e.target.value })}
                className="w-[200px] font-medium"
              />
            </div>
          </div>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" type="button" className="bg-transparent">
                  <Menu className="h-4 w-4 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-medium">
                <DropdownMenuItem onClick={cloneMastermix} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Clone Mastermix
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-2 font-medium text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete Mastermix
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-2 px-4 pb-4">
        {/* Headers */}
        {COLUMN_HEADERS.map(({ title, tooltip }, index) => (
          <div
            key={title}
            className={cn(
              'group relative flex cursor-help items-center gap-1 py-2 text-xs font-medium text-muted-foreground',
              index === 0 && 'col-span-1'
            )}
          >
            <span className="border-b border-dotted border-muted-foreground/50">{title}</span>
            <div className="invisible absolute bottom-full left-0 z-50 max-w-[250px] -translate-y-1 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:visible">
              {tooltip}
            </div>
          </div>
        ))}
        <div className="w-8" /> {/* Actions column */}
        {/* Reagents */}
        {mastermix.reagents.map((reagent) => (
          <div key={reagent.id} className="col-span-full grid grid-cols-subgrid gap-2 pb-2">
            <ReagentDetails
              reagent={reagent}
              canDelete={mastermix.reagents.length > 1}
              errors={validationErrors[reagent.id]}
              showValidation={showValidation}
              onUpdate={(field, value) => updateReagent(reagent.id, field, value)}
              onFieldBlur={handleFieldBlur}
              onDelete={() => removeReagent(reagent.id)}
              onClone={() => cloneReagent(reagent)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
