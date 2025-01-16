import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { FC, useCallback, useEffect, useRef } from 'react';

interface Props {
  plateWellCount: number;
  selectedWellId: number;
  onCellPosition?: (rect: DOMRect | null) => void;
}

export const PlateLayout: FC<Props> = ({ plateWellCount, selectedWellId, onCellPosition }) => {
  const maxColumn = plateWellCount === 96 ? 12 : 24;
  const maxRow = plateWellCount === 96 ? 8 : 16;
  const highlightColor = 'bg-primary text-primary-foreground';
  const cellWidth = `${100 / (maxColumn + 1)}%`;
  const selectedCellRef = useRef<HTMLTableCellElement>(null);

  // Function to update cell position
  const updateCellPosition = useCallback(() => {
    if (selectedCellRef.current && onCellPosition) {
      const rect = selectedCellRef.current.getBoundingClientRect();
      onCellPosition(rect);
    } else if (onCellPosition) {
      onCellPosition(null);
    }
  }, [onCellPosition]);

  // Report cell position when selected cell changes
  useEffect(() => {
    updateCellPosition();
  }, [selectedWellId, updateCellPosition]);

  // Update position on window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateCellPosition);
    };

    const handleScroll = () => {
      requestAnimationFrame(updateCellPosition);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [updateCellPosition]);

  // Generate column headers (1-12 or 1-24)
  const horizontalHeader = Array.from({ length: maxColumn }, (_, i) => (
    <TableCell key={i + 1} className="h-8 p-0 text-center" style={{ width: cellWidth }}>
      {i + 1}
    </TableCell>
  ));

  // Generate rows (A-H or A-P)
  const rows = Array.from({ length: maxRow }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode('A'.charCodeAt(0) + rowIndex);
    const cells = Array.from({ length: maxColumn }, (_, colIndex) => {
      const wellId = maxRow * colIndex + (rowIndex + 1);
      const isSelected = selectedWellId === wellId;

      return (
        <TableCell
          key={colIndex}
          ref={isSelected ? selectedCellRef : null}
          className={cn('h-8 border p-0 transition-colors', isSelected && highlightColor)}
          style={{ width: cellWidth }}
        />
      );
    });

    return (
      <TableRow key={rowLabel}>
        <TableCell className="h-8 p-0 text-center font-medium" style={{ width: cellWidth }}>
          {rowLabel}
        </TableCell>
        {cells}
      </TableRow>
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plate Layout</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 p-0" style={{ width: cellWidth }} />
              {horizontalHeader}
            </TableRow>
          </TableHeader>
          <TableBody>{rows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
