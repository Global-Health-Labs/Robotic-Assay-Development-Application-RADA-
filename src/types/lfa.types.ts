export type PlateLocation = {
  dx: number;
  dz: number;
};

export type AssayPlateConfig = {
  id: string;
  name: string;
  description: string;
  assayPlatePrefix: string;
  numPlates: number;
  numStrips: number;
  numColumns: number;
  locations: PlateLocation[];
};
