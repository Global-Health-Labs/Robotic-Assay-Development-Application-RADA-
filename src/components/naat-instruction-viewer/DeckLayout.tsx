import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FC } from 'react';
import { PLATE_LAYOUT_NAME } from './types';

interface Props {
  selectedPlate: string;
  deckLayoutId?: string;
}

export const DeckLayout: FC<Props> = ({ selectedPlate, deckLayoutId }) => {
  // Default plate layout if no deckLayoutId is provided
  const defaultPlateLayout = {
    id: 'default',
    platePositions: [
      { id: PLATE_LAYOUT_NAME.IVL_96_FLAT_01 },
      { id: PLATE_LAYOUT_NAME.IVL_96_FLAT_02 },
      { id: PLATE_LAYOUT_NAME.IVL_96_DW_01 },
      { id: PLATE_LAYOUT_NAME.IVL_96_DW_02 },
      { id: PLATE_LAYOUT_NAME.IVL_96_FLAT_03 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_01 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_02 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_03 },
      { id: PLATE_LAYOUT_NAME.IVL_384_FLAT_01 },
      { id: PLATE_LAYOUT_NAME.IVL_384_FLAT_02 },
      { id: PLATE_LAYOUT_NAME.IVL_96_TEMPLATE_01 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_04 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_05 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_06 },
      { id: PLATE_LAYOUT_NAME.PCR_COOLER_07 },
    ],
  };

  const layout = deckLayoutId
    ? { id: deckLayoutId, platePositions: defaultPlateLayout.platePositions }
    : defaultPlateLayout;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-sm font-medium">Deck Layout</div>
        <div className="relative grid grid-cols-6 gap-6">
          {/* Tip Locations */}
          <div className="col-span-1">
            <div className="mb-2 text-center text-sm font-semibold">Tip Locations</div>
            <div className="h-[400px] rounded border-2 border-black bg-white" />
          </div>

          {/* Plate Grid Section */}
          <div className="col-span-3 flex flex-col space-y-2">
            <div className="text-center text-sm font-semibold">Plate Locations On Deck</div>
            <div className="grid flex-1 grid-cols-3 gap-x-6">
              {/* First Column */}
              <div className="grid h-full grid-cols-1 grid-rows-5 gap-y-2">
                {layout.platePositions.slice(0, 5).map((plate) => (
                  <div
                    key={plate.id}
                    className={cn(
                      'flex items-center justify-center rounded border-2 border-black p-2 text-xs transition-colors sm:text-sm',
                      selectedPlate === plate.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-white'
                    )}
                  >
                    {plate.id}
                  </div>
                ))}
              </div>

              {/* Second Column */}
              <div className="grid grid-cols-1 grid-rows-5 gap-y-2">
                {layout.platePositions.slice(5, 10).map((plate) => (
                  <div
                    key={plate.id}
                    className={cn(
                      'flex items-center justify-center rounded border-2 border-black p-2 text-xs transition-colors sm:text-sm',
                      selectedPlate === plate.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-white'
                    )}
                  >
                    {plate.id}
                  </div>
                ))}
              </div>

              {/* Third Column */}
              <div className="grid grid-cols-1 grid-rows-5 gap-y-2">
                {layout.platePositions.slice(10, 15).map((plate) => (
                  <div
                    key={plate.id}
                    className={cn(
                      'flex items-center justify-center rounded border-2 border-black p-2 text-xs transition-colors sm:text-sm',
                      selectedPlate === plate.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-white'
                    )}
                  >
                    {plate.id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plate Sealer */}
          <div className="col-span-1 flex h-full flex-col">
            <div className="mb-2 text-center text-sm font-semibold">Plate Sealer</div>
            <div className="flex-1 rounded border-2 border-black bg-white" />
          </div>

          {/* Waste */}
          <div className="col-span-1">
            <div className="mb-2 text-center text-sm font-semibold">Waste</div>
            <div className="mt-[50%] h-1/2 rounded border-2 border-black bg-white" />
          </div>
        </div>

        <div className="text-sm font-medium text-muted-foreground">Front of Machine</div>
      </div>
    </Card>
  );
};
