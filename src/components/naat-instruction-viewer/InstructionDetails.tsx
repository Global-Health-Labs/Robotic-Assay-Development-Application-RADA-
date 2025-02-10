import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FC, useRef, useEffect } from 'react';
import { SelectedState } from './types';
import { useFloating, offset, flip, shift, arrow, autoUpdate, Strategy } from '@floating-ui/react';
import { plateIdToName } from '@/components/naat-instruction-viewer/plate.util';

interface Props {
  selectedState: SelectedState;
  cellPosition?: DOMRect | null;
  className?: string;
}

export const InstructionDetails: FC<Props> = ({ selectedState, cellPosition, className }) => {
  const arrowRef = useRef(null);

  const {
    x,
    y,
    strategy,
    placement,
    refs,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    placement: 'right',
    whileElementsMounted: autoUpdate,
    middleware: [offset(20), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
  });

  // Update virtual element when cellPosition changes
  useEffect(() => {
    if (cellPosition) {
      refs.setPositionReference({
        getBoundingClientRect: () => ({
          ...cellPosition,
          x: cellPosition.x,
          y: cellPosition.y,
          top: cellPosition.top,
          left: cellPosition.left,
          right: cellPosition.right,
          bottom: cellPosition.bottom,
          width: cellPosition.width,
          height: cellPosition.height,
        }),
      });
    }
  }, [cellPosition, refs]);

  const highlightText = (text: string | number) => (
    <span className="font-bold text-primary">{text}</span>
  );

  const renderInstruction = () => {
    if (selectedState.volume === 0) {
      return (
        <p className="text-muted-foreground">
          Click each row in the solution table to see the instruction on how to load the experiment.
        </p>
      );
    }

    return (
      <p className="text-sm leading-7">
        Load {highlightText(`${selectedState.volume} uL`)} of reagent{' '}
        {highlightText(selectedState.solution)} into well {highlightText(selectedState.wellLabel)}{' '}
        in plate at location {highlightText(plateIdToName(selectedState.plate))} on the deck
      </p>
    );
  };

  if (!cellPosition || selectedState.volume === 0) {
    return null;
  }

  return (
    <div
      ref={refs.setFloating}
      style={{
        position: strategy as Strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
        zIndex: 50,
      }}
      className={cn(
        'opacity-1 transition-opacity duration-200',
        cellPosition.top < 120 && 'opacity-0'
      )}
    >
      <Card
        className={cn('w-[350px] shadow-lg transition-all duration-200', 'border-2', className)}
      >
        <div
          ref={arrowRef}
          className="absolute h-4 w-4 rotate-45 border-b border-l border-border bg-card"
          style={{
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [placement === 'right' ? 'left' : 'right']: '-8px',
          }}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg">Instruction</CardTitle>
        </CardHeader>
        <CardContent>{renderInstruction()}</CardContent>
      </Card>
    </div>
  );
};
