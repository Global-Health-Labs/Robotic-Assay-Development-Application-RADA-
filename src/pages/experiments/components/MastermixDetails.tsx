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
import { useNAATLiquidTypes } from '@/hooks/useLiquidTypes';
import { useVolumeUnits } from '@/hooks/useVolumeUnits';
import { cn } from '@/lib/utils';
import { CopyPlus, GripVertical, Menu, PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { ReagentDetails } from './ReagentDetails';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable Reagent Row component
interface SortableReagentRowProps {
  id: string;
  children: React.ReactNode;
}

function SortableReagentRow({ id, children }: SortableReagentRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? 'relative' : ('static' as any),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('col-span-full pb-2', isDragging && 'opacity-50')}
    >
      <div className="flex items-start">
        <div className="flex-1">{children}</div>
        <div
          {...attributes}
          {...listeners}
          className="flex cursor-grab items-center px-1 py-2.5 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

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

  const { data: liquidTypes, isLoading: liquidTypesLoading } = useNAATLiquidTypes();
  const { data: volumeUnits, isLoading: volumeUnitsLoading } = useVolumeUnits();

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mastermix.reagents.findIndex((r) => r.id === active.id);
      const newIndex = mastermix.reagents.findIndex((r) => r.id === over.id);

      const updatedReagents = arrayMove(mastermix.reagents, oldIndex, newIndex);

      onUpdate({
        ...mastermix,
        reagents: updatedReagents,
      });
    }
  };

  if (liquidTypesLoading || volumeUnitsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="mastermix-container space-y-4 rounded-lg border border-zinc-200 shadow">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-2 bg-sky-50 px-4 py-2">
          <div className="ml-6 flex flex-col gap-1">
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
        <div className="w-24" /> {/* Actions column */}
        {/* Reagents with drag and drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={mastermix.reagents.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {mastermix.reagents.map((reagent) => (
              <SortableReagentRow key={reagent.id} id={reagent.id}>
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
              </SortableReagentRow>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
