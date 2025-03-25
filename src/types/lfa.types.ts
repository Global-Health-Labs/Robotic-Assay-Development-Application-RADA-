import { PlateItem } from '@/types/plate.types';

export type PlateLocation = {
  name: string;
  dx: number;
  dz: number;
};

export type AssayPlateConfig = {
  id: string;
  name: string;
  description: string;
  assayPlatePrefix: string;
  deviceType: 'Strip' | 'Cassette';
  numPlates: number;
  numRows: number;
  numColumns: number;
  locations: PlateLocation[];
};

export type LFADeckLayout = {
  id: string;
  name: string;
  description?: string;
  platePositions: PlateItem[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    fullname: string;
  };
};
