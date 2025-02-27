import { NAATDeckLayout } from '@/api/naat-experiments.api';
import { LFADeckLayout } from '@/types/lfa.types';

interface DeckLayoutPreviewProps {
  layout: NAATDeckLayout | LFADeckLayout;
}

export function DeckLayoutPreview({ layout }: DeckLayoutPreviewProps) {
  return (
    <div className="">
      <div className="grid grid-cols-3 gap-2">
        {layout.platePositions.map((plate) => (
          <div
            key={plate.id}
            className="flex items-center justify-center truncate rounded-md border bg-muted p-2 text-xs sm:text-sm"
          >
            {plate.isEmpty ? 'Empty' : plate.name}
          </div>
        ))}
      </div>
    </div>
  );
}
