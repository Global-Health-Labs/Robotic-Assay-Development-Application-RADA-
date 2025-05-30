import { NAATDeckLayout } from '@/api/naat-experiments.api';
import { getLiquidClass, getTipType } from './ExtractLiquidClass';

/**
 * Constant represents the maximum allowed volume of mastermix
 *
 * If the calculated mastermix volume exceeds the maximum value specified here,
 * we will need to split mastermix volume into multiple wells.
 */
const MAX_VOLUME_IN_uL = 600;

interface VolumeStep {
  volume: number;
  tipType: number;
  liquidClass: string;
}

/**
 * Calculate and return the volume of mastermix (in uL).
 */
export const getVolumeMastermix = (
  numOfSampleConcentrations: number,
  numOfTechnicalReplicates: number,
  volPerReaction: number,
  holdOverVolumeFactor: number
): number => {
  return (
    numOfSampleConcentrations * numOfTechnicalReplicates * volPerReaction * holdOverVolumeFactor
  );
};

/**
 * Calculate and return working volume in uL.
 * @returns volume (uL) for source beside water
 */
export const getVolumeWorking = (
  numOfSampleConcentrations: number,
  numOfTechnicalReplicates: number,
  volPerReaction: number,
  volSample: number,
  holdOverVolumeFactor: number
): number => {
  return (
    numOfSampleConcentrations *
    numOfTechnicalReplicates *
    (volPerReaction + volSample) *
    holdOverVolumeFactor
  );
};

export const getHoldOverVolumeFactor = (plateName: string, deckLayout: NAATDeckLayout): number => {
  const plateConfig = deckLayout.platePositions.find(
    (p) => p.name.toLowerCase() === plateName.toLowerCase()
  );
  return plateConfig?.holdoverVolumeFactor ?? 1;
};

/**
 * Calculate and return the list of volume for each source (in uL).
 * All elements in the returned list will populate into the worklist (csv) file.
 */
export const getVolume_uL = (
  numOfWells: number,
  volumeMastermix: number,
  stockConcentration: number,
  finalConcentration: number,
  liquidType: string,
  dispenseType: string
): VolumeStep[] => {
  // List of volume that will return (the elements in this array will populate into the worklist file)
  const volumeEachSource: number[] = [];

  // Handle the case when there is only one well required
  // If more than 1 well required, it means the mastermix exceeds max volume
  // and must split into multiple wells
  if (numOfWells === 1) {
    // Calculate the volume of the source
    const volume = calculateVolumnEachSourceRoundUp(
      volumeMastermix,
      finalConcentration,
      stockConcentration
    );
    volumeEachSource.push(volume);

    // Compare the volume of the source with tip type
    return compareVolumeWithTipType(volumeEachSource, liquidType, dispenseType);
  }

  // Calculate volume of each source based on the total number of wells required
  const updatedVolumeMastermix = volumeMastermix / numOfWells;
  for (let i = 1; i <= numOfWells; i++) {
    const result = calculateVolumnEachSourceRoundUp(
      updatedVolumeMastermix,
      finalConcentration,
      stockConcentration
    );
    volumeEachSource.push(result);
  }

  // Since we round up the volume of each source, we need to calculate the difference to match the original mastermix volume
  let sumOfVolumeEachSource = 0;
  for (const e of volumeEachSource) {
    sumOfVolumeEachSource += e;
  }

  const originalMaxVolumnMastermix = calculateVolumeEachSource(
    volumeMastermix,
    finalConcentration,
    stockConcentration
  );
  const delta = sumOfVolumeEachSource - originalMaxVolumnMastermix;

  // Remove the last element in volume list
  const volumnToRemove = volumeEachSource.pop() || 0;

  // Add new volume to the list
  const volumeDelta = Math.round((volumnToRemove - delta + Number.EPSILON) * 10) / 10;
  volumeEachSource.push(volumeDelta);

  // Compare the volume of the source with tip type. Note that volume for each source must be less than tip type.
  return compareVolumeWithTipType(volumeEachSource, liquidType, dispenseType);
};

/**
 * Returns the value of volume for each source in uL.
 */
export const calculateVolumeEachSource = (
  volumeMastermix: number,
  finalConcentration: number,
  stockConcentration: number
): number => {
  // Assume that final concentration and stock concentration have the same unit
  return volumeMastermix * (finalConcentration / stockConcentration); // in uL
};

/**
 * Round up the value of volume to 2 decimal points.
 */
const calculateVolumnEachSourceRoundUp = (
  volumeMastermix: number,
  finalConcentration: number,
  stockConcentration: number
): number => {
  const volume = calculateVolumeEachSource(volumeMastermix, finalConcentration, stockConcentration);
  return Math.round((volume + Number.EPSILON) * 10) / 10;
};

/**
 * Returns the total number of wells required to split the mastermix volume into.
 *
 * The purpose of this function is to determine if we need to split mastermix volume into multiple wells.
 */
export const calcuateNumOfWells = (volumeMastermix: number): number => {
  // No splitting since the mastermix volume is less than the maximum volume
  if (volumeMastermix <= MAX_VOLUME_IN_uL) {
    return 1;
  }

  // Split the mastermix volume to get the total number of wells required
  // to meet the total volume
  return Math.ceil(volumeMastermix / MAX_VOLUME_IN_uL);
};

/**
 * Compare the volume of each source with the tip type.
 * Volume to be pipetted must be smaller than the tip type. If the volume is greater than the
 * tip type, we need to split the volume into multiple pippetting events.
 */
const compareVolumeWithTipType = (
  listOfVolumeEachSource: number[],
  liquidType: string,
  dispenseType: string
): VolumeStep[] => {
  const volumeList: VolumeStep[] = [];

  // Compare the volume of the source with tip type
  listOfVolumeEachSource.forEach((volume) => {
    // Check the returned value of tip type
    const tipType = getTipType(liquidType, volume);
    let finalTipType = 0;

    if (tipType.tip !== -1) {
      finalTipType = tipType.tip; // valid tip type
    } else {
      // The volume exceeds the maximum required volume in tip (require volume splitting)
      finalTipType = tipType.maxVolume; // use the maximum possible tip type based on dispense type and liquid type
    }

    const liquidClass = getLiquidClass(liquidType, dispenseType, finalTipType);

    if (volume >= finalTipType) {
      // Calculate how many times to split (pipetting events)
      const numToSplit = Math.ceil(volume / finalTipType);

      // New volume after split (round to one decimal point)
      const volumeAfterSplit = Math.round((volume / numToSplit + Number.EPSILON) * 10) / 10;

      /**
       * Assume we split equally, so add each new volume after split to the final list.
       * For example, the orignal volume of 150uL with 50 tip type will be splitted
       * into 3 pipetting events (50uL each)
       */
      for (let i = 1; i <= numToSplit; i++) {
        volumeList.push({
          volume: volumeAfterSplit,
          tipType: finalTipType,
          liquidClass: liquidClass,
        });
      }
    } else {
      // No splitting
      volumeList.push({
        volume: volume,
        tipType: finalTipType,
        liquidClass: liquidClass,
      });
    }
  });

  return volumeList;
};

/**
 * Calculate the volume of water source.
 */
const calculateVolumeOfWater = (
  volumeOfMastermix: number,
  totalVolumeBesideWater: number
): number => {
  return Math.round((volumeOfMastermix - totalVolumeBesideWater + Number.EPSILON) * 10) / 10;
};

/**
 * Calculate and return the list of volume of water source (in uL).
 * All elements in the returned list will populate into the worklist (csv) file.
 */
export const getVolume_uL_water = (
  numOfWells: number,
  volumeOfMastermix: number,
  totalVolumeBesideWater: number,
  liquidType: string,
  dispenseType: string
): VolumeStep[] => {
  // List of volume that will return (the elements in this array will populate into the worklist file)
  const volumeEachSource: number[] = [];

  // Handle the case when there is only one well required
  if (numOfWells === 1) {
    // Calculate the volume of the source
    const volume = calculateVolumeOfWater(volumeOfMastermix, totalVolumeBesideWater);
    volumeEachSource.push(volume);

    // Compare the volume of the source with tip type
    return compareVolumeWithTipType(volumeEachSource, liquidType, dispenseType);
  }

  // Calculate volume of each source based on the total number of wells required
  const updatedVolumeMastermix = volumeOfMastermix / numOfWells;
  const updatedTotalVolumeBesideWater = totalVolumeBesideWater / numOfWells;

  for (let i = 1; i <= numOfWells; i++) {
    const result = calculateVolumeOfWater(updatedVolumeMastermix, updatedTotalVolumeBesideWater);
    volumeEachSource.push(result);
  }

  // Compare the volume of the source with tip type
  return compareVolumeWithTipType(volumeEachSource, liquidType, dispenseType);
};
