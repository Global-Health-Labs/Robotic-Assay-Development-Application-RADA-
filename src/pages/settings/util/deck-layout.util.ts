import { PlateDescriptor, PlateItem, WellCount } from '@/types/plate.types';

export function generateSequenceNumber(count: number): string {
  return count.toString().padStart(4, '0');
}

export function generatePlateName(
  wellCount: WellCount,
  plateDescriptor: PlateDescriptor,
  sequenceNumber: string
): string {
  return `${wellCount}_${plateDescriptor}_${sequenceNumber}`;
}

export function createDefaultPlates(): PlateItem[] {
  return Array.from({ length: 15 }, (_, index) => {
    // For demo purposes, assign some default values
    const wellCount: WellCount = 96;
    const plateDescriptor: PlateDescriptor = 'Flat';
    const sequenceNumber = generateSequenceNumber(index + 1);

    return {
      id: `PLATE_${index}`,
      name: generatePlateName(wellCount, plateDescriptor, sequenceNumber),
      wellCount,
      plateDescriptor,
      sequenceNumber,
      isEmpty: false,
    };
  });
}
