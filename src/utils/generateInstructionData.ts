import { NAATExperimentWithMastermix, Mastermix } from '@/api/naat-experiments.api';
import { uniqBy } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { getMastermixWorklistData } from './generateMastermixWorklist';
import { getSampleWorklistData } from './generateSampleWorklist';

interface InstructionData {
  id: string;
  source: string;
  plate: string;
  well: number;
  totalSourceVolumes: number;
  isDone: boolean;
}

/**
 * Generate the list of data to be used for interactive instructions.
 * @param listOfMastermixes - List of mastermixes data
 * @param experimentalPlanData - Experimental plan data
 * @returns The array of objects containing instruction data
 */
export const getInstructionData = (
  listOfMastermixes: Mastermix[],
  experimentalPlanData: NAATExperimentWithMastermix[]
): InstructionData[] => {
  const data: InstructionData[] = [];

  // Generate the list of mastermix worklist data
  const mmWorklistData = getMastermixWorklistData(listOfMastermixes, experimentalPlanData, false);

  // Sort mastermix data based on plate type and well ID
  mmWorklistData
    .sort((a, b) => a.from_well - b.from_well)
    .sort((a, b) => a.from_plate.localeCompare(b.from_plate, undefined, { sensitivity: 'base' }));

  // Create the list of unique well and plate
  const listOfWellPlate = mmWorklistData.map((row) => ({
    name: `${row.from_well}-${row.from_plate}-${row.source}`,
    from_well: row.from_well,
    from_plate: row.from_plate,
    source: row.source,
  }));
  const uniqueWellPlate = uniqBy(listOfWellPlate, (row) => row.name);
  const totalVolumeSourcePair: InstructionData[] = [];

  // Loop through each well/plate pair to calculate the total volume of each unique well/plate/source
  uniqueWellPlate.forEach((object) => {
    let totalSourceVolume = 0;
    const plateConfig = experimentalPlanData[0].deckLayout.platePositions.find(
      (plate) => plate.name.toLowerCase() === object.from_plate.toLowerCase()
    );
    const holdOverVolumeFactor = plateConfig?.holdoverVolumeFactor ?? 1;

    mmWorklistData.forEach((row) => {
      if (object.name === `${row.from_well}-${row.from_plate}-${row.source}`) {
        totalSourceVolume += row.volume_uL;
      }
    });

    totalVolumeSourcePair.push({
      id: uuidv4(),
      source: object.source.trim(),
      plate: object.from_plate.trim(),
      well: object.from_well,
      totalSourceVolumes: Math.ceil(((totalSourceVolume + 1) * holdOverVolumeFactor) / 10) * 10,
      isDone: false,
    });
  });

  data.push(...totalVolumeSourcePair);

  // Add source from sample worklist
  const sampleWorklistData = getSampleWorklistData(listOfMastermixes, experimentalPlanData);

  // Create the list that contains unique input sources
  const sampleSourceList = sampleWorklistData.map((row) => row.source);
  const uniqueSampleSourceLists = [...new Set(sampleSourceList)];
  const totalVolumeSampleSourcePair: InstructionData[] = [];

  // Calculate total source volume of each sample
  uniqueSampleSourceLists.forEach((source) => {
    let totalSourceVolume = 0;
    let wellId = 0;
    let plate = '';

    sampleWorklistData.forEach((object) => {
      if (source.toLowerCase() === object.source.toLowerCase()) {
        totalSourceVolume += object.volume_uL;
      }
    });

    for (const object of sampleWorklistData) {
      if (object.source.toLowerCase() === source.toLowerCase()) {
        wellId = object.from_well;
        plate = object.from_plate;
        break;
      }
    }

    const deckLayout = experimentalPlanData[0].deckLayout;
    const plateConfig = deckLayout.platePositions.find(
      (p) => p.name.toLowerCase() === plate.toLowerCase()
    );
    const holdOverVolumeFactor = plateConfig?.holdoverVolumeFactor ?? 1;

    totalVolumeSampleSourcePair.push({
      id: uuidv4(),
      source: source.trim(),
      plate: plate.trim(),
      well: wellId,
      totalSourceVolumes: Math.ceil(((totalSourceVolume + 1) * holdOverVolumeFactor) / 10) * 10,
      isDone: false,
    });
  });

  data.push(...totalVolumeSampleSourcePair);

  return data;
};
