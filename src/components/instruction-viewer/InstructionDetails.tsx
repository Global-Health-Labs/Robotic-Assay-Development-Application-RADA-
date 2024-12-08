import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FC, useCallback, useLayoutEffect, useState } from 'react';
import { SelectedState } from './types';

interface Props {
  selectedState: SelectedState;
  cellPosition?: DOMRect | null;
  className?: string;
}

export const InstructionDetails: FC<Props> = ({ selectedState, cellPosition, className }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!cellPosition) return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate initial position
    let top = cellPosition.top - 20; // Slightly above the cell
    let left = cellPosition.right + 20; // To the right of the cell with a gap

    // Card dimensions (estimated)
    const cardWidth = 350; // matches w-[350px]
    const cardHeight = 200; // approximate height

    // Adjust position if it would go off screen
    if (left + cardWidth > viewportWidth) {
      // If there's not enough space on the right, show on the left
      left = cellPosition.left - cardWidth - 20;
    }

    if (top + cardHeight > viewportHeight) {
      // If there's not enough space below, show above
      top = Math.max(20, viewportHeight - cardHeight - 20);
    }

    setPosition({ top, left });
  }, [cellPosition]);

  // Update position when cell position changes or window resizes
  useLayoutEffect(() => {
    updatePosition();

    const handleScroll = () => {
      requestAnimationFrame(updatePosition);
    };

    const handleResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScroll, true); // true for capture phase
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePosition]);

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
        {highlightText(selectedState.solution)} into well{' '}
        <span className="font-bold italic text-primary">{selectedState.wellLabel}</span> in plate at
        location {highlightText(selectedState.plate)} on the deck
      </p>
    );
  };

  if (!cellPosition || selectedState.volume === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        'fixed z-50 w-[350px] shadow-lg transition-all duration-200',
        'after:absolute after:left-[-8px] after:top-[28px] after:h-4 after:w-4 after:rotate-45 after:bg-card',
        'after:border-l after:border-b after:border-border after:shadow-[-2px_2px_2px_rgba(0,0,0,0.1)]',
        'border-2',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">Instruction</CardTitle>
      </CardHeader>
      <CardContent>{renderInstruction()}</CardContent>
    </Card>
  );
};
