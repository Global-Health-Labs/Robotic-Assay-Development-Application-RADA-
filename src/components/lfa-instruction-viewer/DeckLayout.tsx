import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LFADeckLayout as LFADeckLayoutType } from '@/types/lfa.types';
import { FC } from 'react';

interface Props {
  selectedPlate: string;
  deckLayout: LFADeckLayoutType;
}

export const LFADeckLayout: FC<Props> = ({ selectedPlate, deckLayout }) => {
  const layout = deckLayout;
  const { assayPlateConfig } = layout;

  const renderPlateColumn = (column: number) => {
    const numCols = 3;
    const cellsForColumn = layout.platePositions.filter((_, index) => column === index % numCols);
    return (
      <div className="grid h-full grid-cols-1 grid-rows-5 gap-y-2">
        {cellsForColumn.map((plate) => (
          <div
            key={plate.id}
            className={cn(
              'flex items-center justify-center rounded border-2 border-black p-2 text-xs transition-colors sm:text-sm',
              selectedPlate.toLowerCase() === plate.name.toLowerCase()
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-white'
            )}
          >
            {plate.isEmpty ? 'Empty' : plate.name}
          </div>
        ))}
      </div>
    );
  };

  const renderDeviceLocations = () => {
    const { numPlates, numRows, numColumns, deviceType } = assayPlateConfig;
    const numDeviceCols = deviceType === 'Strip' ? 3 : 1; // 3 columns for Strip, 1 for Cassette
    const numDeviceRows = Math.ceil(numPlates / numDeviceCols);

    return (
      <div
        className="grid flex-1 gap-4 rounded border-2 border-muted-foreground p-4"
        style={{
          gridTemplateColumns: `repeat(${numDeviceCols}, 1fr)`,
          gridTemplateRows: `repeat(${numDeviceRows}, 1fr)`,
        }}
      >
        {Array.from({ length: numPlates }).map((_, plateIndex) => (
          <div
            key={plateIndex}
            className={cn(
              'flex flex-col bg-white',
              deviceType === 'Strip' ? 'aspect-[2/3]' : 'aspect-[5/8]'
            )}
          >
            <div
              className="grid h-full w-full gap-1"
              style={{
                gridTemplateRows: `repeat(${numRows}, 1fr)`,
                gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
              }}
            >
              {Array.from({ length: numRows * numColumns }).map((_, cellIndex) => (
                <div key={cellIndex} className="rounded border border-slate-300 bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="max-w-6xl p-4">
      <div className="space-y-4">
        <div className="text-lg font-semibold">Deck Layout</div>
        <div className="relative grid grid-cols-6 gap-6">
          {/* Tip Locations */}
          <div className="col-span-1 flex flex-col">
            <div className="mb-2 text-center text-sm font-semibold">Tip Locations</div>
            <div className="flex-1 rounded border-2 border-black bg-white" />
          </div>

          {/* Plate Grid Section */}
          <div className="col-span-3 flex flex-col space-y-2">
            <div className="text-center text-sm font-semibold">Plate Locations On Deck</div>
            <div className="grid flex-1 grid-cols-3 gap-x-6">
              {/* First Column */}
              {renderPlateColumn(0)}
              {/* Second Column */}
              {renderPlateColumn(1)}
              {/* Third Column */}
              {renderPlateColumn(2)}
            </div>
          </div>

          <div className="col-span-2 grid h-full grid-cols-4 gap-6">
            {/* Device Locations */}
            <div className="col-span-3 flex h-full flex-col">
              <div className="mb-2 text-center text-sm font-semibold">Device Locations</div>
              {renderDeviceLocations()}
            </div>

            {/* Waste */}
            <div className="col-span-1 flex h-full flex-col">
              <div className="mb-2 text-center text-sm font-semibold">Waste</div>
              <div className="flex flex-1 items-center">
                <div className="my-auto h-1/2 w-full rounded border-2 border-black bg-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full text-center text-sm font-medium text-muted-foreground">
          Front of Machine
        </div>
      </div>
    </Card>
  );
};
