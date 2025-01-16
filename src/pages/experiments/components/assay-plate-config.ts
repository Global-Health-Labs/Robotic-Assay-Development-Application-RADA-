import { AssayPlateConfig } from '@/types/lfa.types';

export const ASSAY_PLATE_CONFIGS: AssayPlateConfig[] = [
  {
    id: 'lfa-96-standard',
    name: 'LFA 96-Well Standard',
    description: 'Standard 96-well plate configuration for LFA assays with controls',
    assayPlatePrefix: 'IVL_Plate_v3_96cassettes_ABformat',
    numPlates: 1,
    numStrips: 96,
    numColumns: 6,
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
  },
  {
    id: 'lfa-96-high-throughput',
    name: 'LFA 96-Well High Throughput',
    description: 'High throughput 96-well configuration with minimal controls',
    assayPlatePrefix: 'IVL_Plate_v3_96cassettes_ABformat',
    numPlates: 1,
    numStrips: 96,
    numColumns: 6,
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
  },
  {
    id: 'lfa-384-standard',
    name: 'LFA 384-Well Standard',
    description: 'Standard 384-well plate configuration for high-volume LFA testing',
    assayPlatePrefix: 'IVL_Plate_v3_384cassettes_ABformat',
    numPlates: 1,
    numStrips: 384,
    numColumns: 16,
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
  },
];
