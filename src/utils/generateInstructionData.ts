import { v4 as uuidv4 } from 'uuid';
import { getMastermixWorklistData } from './generateMastermixWorklist';
import { getSampleWorklistData } from './generateSampleWorklist';
import { NAATExperiment, Mastermix } from '@/api/naat-experiments.api';
import { uniq } from 'lodash-es';

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
  experimentalPlanData: NAATExperiment[]
): InstructionData[] => {
  const data: InstructionData[] = [];

  // Generate the list of mastermix worklist data
  const mmWorklistData = getMastermixWorklistData(listOfMastermixes, experimentalPlanData, false);

  // Sort mastermix data based on plate type and well ID
  mmWorklistData
    .sort((a, b) => a.from_well - b.from_well)
    .sort((a, b) => a.from_plate.localeCompare(b.from_plate, undefined, { sensitivity: 'base' }));

  // Create the list of unique well and plate
  const listOfWellPlate = mmWorklistData.map(
    (row) => `${row.from_well}-${row.from_plate}-${row.source}`
  );
  const uniqueWellPlate = uniq(listOfWellPlate);
  const totalVolumeSourcePair: InstructionData[] = [];

  // Loop through each well/plate pair to calculate the total volume of each unique well/plate/source
  uniqueWellPlate.forEach((object) => {
    let totalSourceVolume = 0;
    const [wellIdStr, plate, source] = object.split('-');
    const wellId = Number(wellIdStr.trim());

    mmWorklistData.forEach((row) => {
      if (object === `${row.from_well}-${row.from_plate}-${row.source}`) {
        totalSourceVolume += row.volume_uL;
      }
    });

    totalVolumeSourcePair.push({
      id: uuidv4(),
      source: source.trim(),
      plate: plate.trim(),
      well: wellId,
      totalSourceVolumes: Math.ceil(((totalSourceVolume + 1) * 1.3) / 10) * 10,
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

    totalVolumeSampleSourcePair.push({
      id: uuidv4(),
      source,
      plate,
      well: wellId,
      totalSourceVolumes: Math.ceil(((totalSourceVolume + 1) * 1.3) / 10) * 10,
      isDone: false,
    });
  });

  data.push(...totalVolumeSampleSourcePair);

  return data;
};
