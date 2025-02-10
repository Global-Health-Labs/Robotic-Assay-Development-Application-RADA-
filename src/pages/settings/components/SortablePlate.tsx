import { cn } from '@/lib/utils';
import { PlateDescriptor, PlateItem, WellCount } from '@/types/plate.types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect } from 'react';

const WELL_COUNT_OPTIONS: WellCount[] = [1, 96, 384];
const PLATE_DESCRIPTOR_OPTIONS: PlateDescriptor[] = ['PCR', 'Flat', 'DW', 'V'];

export default function SortablePlate({
  plate,
  onSetEmpty,
  onUpdatePlate,
}: {
  plate: PlateItem;
  onSetEmpty: (id: string, isEmpty: boolean) => void;
  onUpdatePlate: (id: string, updates: Partial<PlateItem>) => void;
}) {
  const { attributes, isDragging, listeners, node, setNodeRef, transform, transition } =
    useSortable({
      id: plate.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isDragging && node?.current) {
      (node.current as HTMLDivElement).classList.add('!bg-secondary', '!text-secondary-foreground');
    } else {
      setTimeout(() => {
        (node.current as HTMLDivElement).classList.remove(
          '!bg-secondary',
          '!text-secondary-foreground'
        );
      }, 500);
    }
  }, [isDragging, node]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'transition-[colors, shadow] rounded-lg border bg-white p-4 shadow-sm ease-in-out hover:shadow-md'
      )}
    >
      <div {...listeners} className="cursor-move">
        {plate.isEmpty ? 'EMPTY' : plate.name}
      </div>
      <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <select
            value={plate.wellCount}
            onChange={(e) =>
              onUpdatePlate(plate.id, { wellCount: Number(e.target.value) as WellCount })
            }
            className="rounded border p-1 text-xs"
            disabled={plate.isEmpty}
          >
            {WELL_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} Wells
              </option>
            ))}
          </select>
          <select
            value={plate.plateDescriptor}
            onChange={(e) =>
              onUpdatePlate(plate.id, { plateDescriptor: e.target.value as PlateDescriptor })
            }
            className="rounded border p-1 text-xs"
            disabled={plate.isEmpty}
          >
            {PLATE_DESCRIPTOR_OPTIONS.map((descriptor) => (
              <option key={descriptor} value={descriptor}>
                {descriptor}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`empty-${plate.id}`}
            checked={plate.isEmpty}
            onChange={(e) => onSetEmpty(plate.id, e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor={`empty-${plate.id}`} className="text-xs">
            Set Empty
          </label>
        </div>
      </div>
    </div>
  );
}
