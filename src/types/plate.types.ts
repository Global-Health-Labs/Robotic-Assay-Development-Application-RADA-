export type PlateItem = {
  id: string;
  name: string;
  isEmpty?: boolean;
  wellCount: WellCount;
  plateDescriptor: PlateDescriptor;
  sequenceNumber: string;
};

export type WellCount = 1 | 96 | 384;
export type PlateDescriptor = 'PCR' | 'Flat' | 'DW' | 'V';
