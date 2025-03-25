import React from 'react';
import { MastermixDetails } from './MastermixDetails';
import { Mastermix } from '@/api/naat-experiments.api';
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
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MastermixTableProps {
  mastermixes: Mastermix[];
  onChange: (mastermixes: Mastermix[]) => void;
  onValidationChange: (isValid: boolean) => void;
  isSubmitted?: boolean;
}

// Sortable Mastermix Row component
interface SortableMastermixProps {
  id: string;
  children: React.ReactNode;
}

function SortableMastermix({ id, children }: SortableMastermixProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    // position: isDragging ? 'relative' : 'static' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn('relative mb-8', isDragging && 'opacity-50')}>
      <div className="absolute left-0 top-7 z-10 flex h-10 items-center px-2 text-muted-foreground hover:text-foreground">
        <div {...attributes} {...listeners} className="cursor-grab rounded p-1 hover:bg-sky-100">
          <GripVertical className="h-6 w-6" />
        </div>
      </div>
      {children}
    </div>
  );
}

export function MastermixTable({
  mastermixes,
  onChange,
  onValidationChange,
  isSubmitted = false,
}: MastermixTableProps) {
  const [validMastermixes, setValidMastermixes] = React.useState<Set<string>>(new Set());

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mastermixes.findIndex((mm) => mm.id === active.id);
      const newIndex = mastermixes.findIndex((mm) => mm.id === over.id);

      const updatedMastermixes = arrayMove(mastermixes, oldIndex, newIndex);
      onChange(updatedMastermixes);
    }
  };

  return (
    <div className="space-y-8">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={mastermixes.map((mm) => mm.id)}
          strategy={verticalListSortingStrategy}
        >
          {mastermixes.map((mastermix) => (
            <SortableMastermix key={mastermix.id} id={mastermix.id}>
              <MastermixDetails
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
            </SortableMastermix>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
