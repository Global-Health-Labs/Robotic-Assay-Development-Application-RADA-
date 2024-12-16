export interface AssayPlateConfig {
  id: string;
  name: string;
  description: string;
  plateSize: '96' | '384';
  assayPlate: {
    name: string;
    numPlates: number;
    numStrips: number;
    numColumns: number;
  };
  locations: Array<{
    dx: number;
    dz: number;
  }>;
  sampleWells: {
    startWell: string;
    endWell: string;
    maxSamples: number;
  };
  controlWells: {
    positiveControls: string[];
    negativeControls: string[];
  };
  replicatesPerSample: number;
  maxSamples: number;
}

export const ASSAY_PLATE_CONFIGS: AssayPlateConfig[] = [
  {
    id: 'lfa-96-standard',
    name: 'LFA 96-Well Standard',
    description: 'Standard 96-well plate configuration for LFA assays with controls',
    plateSize: '96',
    assayPlate: {
      name: 'IVL_Plate_v3_96cassettes_ABformat',
      numPlates: 1,
      numStrips: 96,
      numColumns: 6,
    },
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
    sampleWells: {
      startWell: 'A1',
      endWell: 'H10',
      maxSamples: 80,
    },
    controlWells: {
      positiveControls: ['H11', 'H12'],
      negativeControls: ['G11', 'G12'],
    },
    replicatesPerSample: 2,
    maxSamples: 40,
  },
  {
    id: 'lfa-96-high-throughput',
    name: 'LFA 96-Well High Throughput',
    description: 'High throughput 96-well configuration with minimal controls',
    plateSize: '96',
    assayPlate: {
      name: 'IVL_Plate_v3_96cassettes_ABformat',
      numPlates: 1,
      numStrips: 96,
      numColumns: 6,
    },
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
    sampleWells: {
      startWell: 'A1',
      endWell: 'H11',
      maxSamples: 88,
    },
    controlWells: {
      positiveControls: ['H12'],
      negativeControls: ['G12'],
    },
    replicatesPerSample: 1,
    maxSamples: 88,
  },
  {
    id: 'lfa-384-standard',
    name: 'LFA 384-Well Standard',
    description: 'Standard 384-well plate configuration for high-volume LFA testing',
    plateSize: '384',
    assayPlate: {
      name: 'IVL_Plate_v3_384cassettes_ABformat',
      numPlates: 1,
      numStrips: 384,
      numColumns: 16,
    },
    locations: [
      { dx: 13, dz: 0.2 },
      { dx: 0, dz: 1 },
      { dx: 24, dz: 0 },
    ],
    sampleWells: {
      startWell: 'A1',
      endWell: 'P22',
      maxSamples: 352,
    },
    controlWells: {
      positiveControls: ['O23', 'O24', 'P23', 'P24'],
      negativeControls: ['M23', 'M24', 'N23', 'N24'],
    },
    replicatesPerSample: 2,
    maxSamples: 176,
  },
];
