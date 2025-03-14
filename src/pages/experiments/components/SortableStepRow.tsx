import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ReactNode } from 'react';

interface SortableStepRowProps {
  id: string;
  children: ReactNode;
}

export function SortableStepRow({ id, children }: SortableStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-8 cursor-grab rounded p-1 text-muted-foreground hover:bg-slate-100 active:cursor-grabbing"
      >
        <GripVertical className="h-6 w-6" />
      </div>
      {children}
    </div>
  );
}
