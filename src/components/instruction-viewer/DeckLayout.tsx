import { Card } from '@/components/ui/card';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';
import { FC, useState } from 'react';
import { PLATE_LAYOUT_NAME } from './types';

// Constants for layout dimensions
const LAYOUT_CONTAINER_WIDTH = 600;
const LAYOUT_CONTAINER_HEIGHT = 400;
const LAYOUT_WIDTH = 500;
const LAYOUT_HEIGHT = 300;
const START_X_LAYOUT = (LAYOUT_CONTAINER_WIDTH - LAYOUT_WIDTH) / 2;

// Constants for plate and tip dimensions
const TIP_START_X = START_X_LAYOUT + 20;
const TIP_START_Y = 50;
const TIP_WIDTH = 60;
const TIP_HEIGHT = 250;
const PLATE_TIP_WIDTH = 60;
const PLATE_HEIGHT = 40;

// Colors
const PLATE_COLOR = '#FFFFFF';
const highlightColor = '#2563eb'; // primary color

interface Props {
  selectedPlate?: string;
  onPlateSelect?: (plate: string) => void;
}

export const DeckLayout: FC<Props> = ({ selectedPlate, onPlateSelect }) => {
  const renderPlateLocation = (startXLocation: number, textList: string[]) => {
    const screenWidth = window.screen.width;
    const fontSize = screenWidth < 1500 ? 11 : 14;
    const plateList = [];
    let startYLocation = TIP_START_Y;

    for (let i = 0; i < 5; i++) {
      plateList.push(
        <Group key={i}>
          <Rect
            id={`${i} - ${textList[i]}`}
            x={startXLocation}
            y={startYLocation}
            width={PLATE_TIP_WIDTH}
            height={PLATE_HEIGHT}
            fill={selectedPlate === textList[i] ? highlightColor : PLATE_COLOR}
            stroke="black"
            shadowBlur={2}
            onClick={() => onPlateSelect?.(textList[i])}
          />
          <Text
            x={startXLocation}
            y={startYLocation}
            height={PLATE_HEIGHT}
            verticalAlign="middle"
            align="center"
            width={PLATE_TIP_WIDTH}
            text={textList[i]}
            fontSize={fontSize}
            fill={selectedPlate === textList[i] ? 'white' : 'black'}
          />
        </Group>
      );

      startYLocation = TIP_START_Y + (i + 1) * (PLATE_HEIGHT + 10);
    }

    return <Group>{plateList}</Group>;
  };

  const renderDeckLayout = () => {
    const plateSealer_X = TIP_START_X + 220 + 4 * (TIP_WIDTH + 22);
    const waste_X = TIP_START_X + 220 + 5 * (TIP_WIDTH + 22);

    return (
      <Group>
        <Text x={TIP_START_X} y={20} text={'Tip\nLocations'} align="center" fontStyle="bold" />
        <Rect
          x={TIP_START_X}
          y={TIP_START_Y}
          width={TIP_WIDTH}
          height={TIP_HEIGHT}
          fill={PLATE_COLOR}
          stroke="black"
          shadowBlur={5}
        />

        <Text
          x={TIP_START_X + TIP_WIDTH}
          y={20}
          text={'Plate Locations\nOn Deck'}
          align="center"
          width={PLATE_TIP_WIDTH * 3 + 80}
          fontStyle="bold"
        />

        {renderPlateLocation(TIP_START_X + TIP_WIDTH + 20, [
          PLATE_LAYOUT_NAME.IVL_96_FLAT_01,
          PLATE_LAYOUT_NAME.IVL_96_FLAT_02,
          PLATE_LAYOUT_NAME.IVL_96_DW_01,
          PLATE_LAYOUT_NAME.IVL_96_DW_02,
          PLATE_LAYOUT_NAME.IVL_96_FLAT_03,
        ])}

        {renderPlateLocation(TIP_START_X + 70 + 2 * (TIP_WIDTH + 20), [
          PLATE_LAYOUT_NAME.PCR_COOLER_01,
          PLATE_LAYOUT_NAME.PCR_COOLER_02,
          PLATE_LAYOUT_NAME.PCR_COOLER_03,
          PLATE_LAYOUT_NAME.IVL_384_FLAT_01,
          PLATE_LAYOUT_NAME.IVL_384_FLAT_02,
        ])}

        {renderPlateLocation(TIP_START_X + 150 + 3 * (TIP_WIDTH + 20), [
          PLATE_LAYOUT_NAME.IVL_96_TEMPLATE_01,
          PLATE_LAYOUT_NAME.PCR_COOLER_04,
          PLATE_LAYOUT_NAME.PCR_COOLER_05,
          PLATE_LAYOUT_NAME.PCR_COOLER_06,
          PLATE_LAYOUT_NAME.PCR_COOLER_07,
        ])}

        <Text x={plateSealer_X} y={20} text={'Plate\nSealer'} align="center" fontStyle="bold" />
        <Rect
          x={plateSealer_X}
          y={TIP_START_Y}
          width={TIP_WIDTH}
          height={TIP_HEIGHT}
          fill={PLATE_COLOR}
          stroke="black"
          shadowBlur={5}
        />

        <Text x={waste_X} y={20} text="Waste" fontStyle="bold" />
        <Rect
          x={waste_X}
          y={TIP_START_Y + TIP_HEIGHT / 5}
          width={TIP_WIDTH}
          height={TIP_HEIGHT / 1.5}
          fill={PLATE_COLOR}
          stroke="black"
          shadowBlur={5}
        />
      </Group>
    );
  };

  return (
    <Card className="p-4 mt-4">
      <div className="flex flex-col items-center">
        <h3 className="mb-4 font-bold text-primary">Deck Layout</h3>

        <div className="flex flex-row justify-center">
          <Stage width={LAYOUT_CONTAINER_WIDTH} height={LAYOUT_CONTAINER_HEIGHT}>
            <Layer>
              <Rect
                x={START_X_LAYOUT}
                y={0}
                width={LAYOUT_WIDTH}
                height={LAYOUT_HEIGHT}
                cornerRadius={20}
                stroke="black"
                fill="white"
                shadowBlur={5}
                shadowOffsetX={10}
                shadowOffsetY={5}
                shadowOpacity={0.5}
              />
              {renderDeckLayout()}
            </Layer>
          </Stage>
        </div>

        <div className="mt-2 font-bold">Front of Machine</div>
      </div>
    </Card>
  );
};
