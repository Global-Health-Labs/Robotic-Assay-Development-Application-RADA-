import { Mastermix, Reagent } from '@/api/naat-experiments.api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/page-loading';
import { Separator } from '@/components/ui/separator';
import { useLiquidTypes } from '@/hooks/useLiquidTypes';
import { useVolumeUnits } from '@/hooks/useVolumeUnits';
import { cn } from '@/lib/utils';
import { CopyPlus, Menu, PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { ReagentDetails } from './ReagentDetails';

interface MastermixDetailsProps {
  mastermix: Mastermix;
  canDelete: boolean;
  showValidation: boolean;
  onUpdate: (mastermix: Mastermix) => void;
  onDelete: () => void;
  onValidationChange: (id: string, isValid: boolean) => void;
}

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
  canDelete,
  onUpdate,
  onDelete,
  onValidationChange,
  showValidation,
}: MastermixDetailsProps) {
  // Track validation status of each reagent
  const [reagentValidation, setReagentValidation] = React.useState<Record<string, boolean>>({});
  const [nameValid, setNameValid] = React.useState(!!mastermix.name);

  const { data: liquidTypes, isLoading: liquidTypesLoading } = useLiquidTypes();
  const { data: volumeUnits, isLoading: volumeUnitsLoading } = useVolumeUnits();

  // Update overall validation status whenever a reagent's validation changes
  useEffect(() => {
    const allReagentsValid = mastermix.reagents.every((reagent) => reagentValidation[reagent.id]);
    const isValid = allReagentsValid && nameValid && mastermix.reagents.length > 0;
    onValidationChange(mastermix.id, isValid);
  }, [reagentValidation, nameValid, mastermix.reagents, mastermix.id, onValidationChange]);

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
      setReagentValidation((prev) => {
        const next = { ...prev };
        delete next[reagentId];
        return next;
      });

      onUpdate(updatedMastermix);
    }
  };

  const cloneReagent = (reagent: Reagent) => {
    const newReagent: Reagent = {
      ...reagent,
      id: crypto.randomUUID(),
      source: `${reagent.source} (Copy)`,
    };

    const updatedMastermix = {
      ...mastermix,
      reagents: [...mastermix.reagents, newReagent],
    };
    onUpdate(updatedMastermix);
  };

  const addReagent = () => {
    const newReagent: Reagent = {
      id: crypto.randomUUID(),
      source: '',
      unit: volumeUnits ? volumeUnits[0].unit : '',
      finalConcentration: '' as unknown as number,
      stockConcentration: '' as unknown as number,
      liquidType: liquidTypes ? liquidTypes[0].value : '',
    };

    onUpdate({
      ...mastermix,
      reagents: [...mastermix.reagents, newReagent],
    });
  };

  const cloneMastermix = () => {
    const newMastermix = {
      ...mastermix,
      id: crypto.randomUUID(),
      name: `${mastermix.name} (Copy)`,
    };
    onUpdate(newMastermix);
  };

  const handleNameChange = (name: string) => {
    setNameValid(!!name);
    onUpdate({ ...mastermix, name });
  };

  if (liquidTypesLoading || volumeUnitsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="mastermix-container space-y-4 rounded-lg border border-zinc-200 shadow">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-2 bg-sky-50 px-4 py-2">
          <div className="flex flex-col gap-1">
            <p className={cn('text-xs', nameValid ? 'text-muted-foreground' : 'text-destructive')}>
              Mastermix Name
            </p>
            <div className="flex gap-2">
              <Input
                value={mastermix.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={cn(
                  'w-[200px] font-medium placeholder:text-xs placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0',
                  showValidation && !nameValid && 'border-red-500'
                )}
                placeholder="Enter mastermix name..."
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
              <DropdownMenuContent align="end" className="space-y-1">
                <DropdownMenuItem onClick={addReagent} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Reagent
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={cloneMastermix} className="gap-2">
                  <CopyPlus className="h-4 w-4" />
                  Copy Mastermix
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 font-medium text-destructive"
                  disabled={!canDelete}
                >
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
          <div key={reagent.id} className="col-span-full pb-2">
            <ReagentDetails
              reagent={reagent}
              canDelete={mastermix.reagents.length > 1}
              onUpdate={(field, value) => updateReagent(reagent.id, field, value)}
              onDelete={() => removeReagent(reagent.id)}
              onClone={() => cloneReagent(reagent)}
              liquidTypes={liquidTypes || []}
              volumeUnits={volumeUnits || []}
              onValidationChange={(isValid) => {
                setReagentValidation((prev) => ({
                  ...prev,
                  [reagent.id]: isValid,
                }));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
