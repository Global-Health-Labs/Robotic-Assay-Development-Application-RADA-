import { NAATExperiment, Mastermix } from '@/api/naat-experiments.api';
import {
  SourceKeyPair,
  VolumeSourcePair,
  VolumeStep,
  WellTracker,
  WorklistData,
} from '@/utils/experiment.types';
import { omit } from 'lodash-es';
import { ALIQUOTING_MM, MIX_MM, VALUE } from '../config/worklist/DefaultValues';
import {
  calcuateNumOfWells,
  calculateVolumeEachSource,
  getVolume_uL,
  getVolume_uL_water,
  getVolumeMastermix,
  getVolumeWorking,
} from './VolumeCalculation';
import {
  FROM_PLATE_DW,
  getFromPlate_MM,
  getToPlate_AQ,
  getTotalWellsPerMastermix,
} from './WellPlateCalculation';
import * as wl from './WorklistCalculation';

/**
 * This function is used to perform calculations to generate worklist file in CSV format.
 */
export const getMastermixWorklistData = (
  listOfMastermixes: Mastermix[],
  experimentalPlanData: NAATExperiment[],
  generateAllData: boolean
): WorklistData[] => {
  const data: WorklistData[] = [];
  let groupNumber = 0;
  let previousRowLiquidClass = '';
  let currentRowLiquidClass = '';
  let currentRowSource = '';
  let previousRowSource = '';
  const listOfTotalVolumesEachMM: number[] = [];
  let totalVolumeEachMM = 0;

  const {
    mastermixVolumePerReaction,
    numOfSampleConcentrations,
    numOfTechnicalReplicates,
    sampleVolumePerReaction,
  } = experimentalPlanData[0];

  // Calculate volume of mastermix
  const volumeOfMastermix = getVolumeMastermix(
    numOfSampleConcentrations,
    numOfTechnicalReplicates,
    mastermixVolumePerReaction
  );

  const volumeWorking = getVolumeWorking(
    numOfSampleConcentrations,
    numOfTechnicalReplicates,
    mastermixVolumePerReaction,
    sampleVolumePerReaction
  );

  const numOfWells = calcuateNumOfWells(volumeOfMastermix);

  /*
   * Loop through each mastermix to generate data for making the mastermix
   */
  listOfMastermixes.forEach((mastermix) => {
    // Calculate the total volumes of other components in mastermix beside water
    let totalVolumeBesideWater = 0;
    mastermix.reagents.forEach((recipe) => {
      let volume_ul = 0;
      if (recipe.source.trim().toLowerCase() !== 'water') {
        volume_ul = calculateVolumeEachSource(
          volumeWorking,
          recipe.finalConcentration,
          recipe.stockConcentration
        );
      }
      totalVolumeBesideWater += volume_ul;
    });

    // Loop through each recipe source in mastermix
    mastermix.reagents.forEach((recipe) => {
      let listOfVolume: VolumeStep[];

      // Calculate volume for water source
      if (recipe.source.trim().toLowerCase() === 'water') {
        listOfVolume = getVolume_uL_water(
          numOfWells,
          volumeOfMastermix,
          totalVolumeBesideWater,
          recipe.liquidType,
          recipe.dispenseType!
        );
      } else {
        listOfVolume = getVolume_uL(
          numOfWells,
          volumeWorking,
          recipe.stockConcentration,
          recipe.finalConcentration,
          recipe.liquidType,
          recipe.dispenseType!
        );
      }

      totalVolumeEachMM += listOfVolume[0].volume;

      listOfVolume.forEach((step) => {
        data.push({
          id: mastermix.id,
          recipeId: recipe.id,
          step: mastermix.name,
          dx: VALUE.COLUMN_B,
          dz: VALUE.COLUMN_C,
          volume_uL: step.volume,
          liquid_class: step.liquidClass,
          timer_delta: VALUE.COLUMN_F,
          source: recipe.source,
          step_index: VALUE.COLUMN_H,
          destination: VALUE.COLUMN_I,
          group_number: 0,
          timer_group_check: VALUE.COLUMN_K,
          guid: VALUE.COLUMN_L,
          from_path: VALUE.COLUMN_M,
          asp_mixing: wl.getAspMixing(recipe.tipWashing!),
          dispense_type: recipe.dispenseType!,
          tip_type: step.tipType.toString(),
          touchoff_dis: VALUE.COLUMN_Q,
          to_plate: VALUE.COLUMN_R,
          to_well: 0,
          from_plate: '',
          from_well: 0,
        });
      });
    });

    // Add total volumes of each mixture to the list (to be used for mixing steps)
    listOfTotalVolumesEachMM.push(totalVolumeEachMM);
    totalVolumeEachMM = 0; // re-initialize value
  });

  // Create the list that contains unique input sources
  const sourceLists = data.map((row) => row.source);
  const uniqueSourceLists = [...new Set(sourceLists)];
  const totalVolumeSourcePair: VolumeSourcePair[] = [];
  const sortedKeyPairs: SourceKeyPair[] = [];

  // Create sorted key pairs for each unique source
  uniqueSourceLists.forEach((source, index) => {
    sortedKeyPairs.push({
      source: source,
      index: index,
    });
  });

  // Assign sorted keys to data entries
  sortedKeyPairs.forEach((source) => {
    data.forEach((object) => {
      if (source.source.toLowerCase() === object.source.toLowerCase()) {
        const sortedKey = `${source.index}-${object.source} - ${object.liquid_class} - ${object.id} - ${object.recipeId}`;
        object.sortedKey = sortedKey;
      }
    });
  });

  // Sort mastermix data based on source and liquid type
  data.sort((a, b) => {
    return (a.sortedKey || '').localeCompare(b.sortedKey || '', undefined, { sensitivity: 'base' });
  });

  // Calculate total source volume of all recipes
  uniqueSourceLists.forEach((source, index) => {
    let totalSourceVolume = 0;
    data.forEach((object) => {
      if (source.toLowerCase() === object.source.toLowerCase()) {
        totalSourceVolume += object.volume_uL;
      }
    });
    totalVolumeSourcePair.push({
      source: source,
      totalSourceVolumes: totalSourceVolume,
      index: index,
    });
  });

  let toWellID = 1;
  const totalMM = listOfMastermixes.length;
  const totalWellAfterSplit = totalMM * numOfWells;

  const current_DW: WellTracker = {
    wellValue: 0,
    sampleIndex: 1,
    startFromWell: 1,
    previousNumOfWells: 0,
  };

  const current_flat: WellTracker = {
    wellValue: 0,
    sampleIndex: 1,
    startFromWell: 1,
    previousNumOfWells: 0,
  };

  let maxNumOfWells = 0;

  // Loop through each data entry to assign group ID, to/from well ID
  data.forEach((object) => {
    currentRowSource = object.source.toLowerCase();
    currentRowLiquidClass = object.liquid_class;

    // Group by liquid class and source name
    if (
      previousRowLiquidClass !== currentRowLiquidClass ||
      previousRowSource !== currentRowSource
    ) {
      groupNumber++;
    }

    // Assign group number
    object.group_number = groupNumber;
    previousRowLiquidClass = currentRowLiquidClass;

    // Assign to_well ID (1 well per mastermix)
    object.to_well = toWellID;
    if (toWellID < totalWellAfterSplit) {
      toWellID++;
    } else {
      toWellID = 1;
    }

    // Assign from_plate value
    const currentRowFromPlate = getFromPlate_MM(totalVolumeSourcePair, object.source);
    object.from_plate = currentRowFromPlate;

    current_DW.previousNumOfWells = maxNumOfWells;
    current_flat.previousNumOfWells = maxNumOfWells;

    // Get max well number of each source
    if (previousRowSource !== currentRowSource) {
      for (const volumeSource of totalVolumeSourcePair) {
        if (volumeSource.source.toLowerCase() === currentRowSource.toLowerCase()) {
          // Calculate max volume per well (practical 80%)
          const maxWellVolume = currentRowFromPlate === FROM_PLATE_DW ? 700 : 140;
          maxNumOfWells = Math.ceil((volumeSource.totalSourceVolumes * 1.3) / maxWellVolume);
          break;
        }
      }
    }

    // Handle deep well plate type:
    // The goal here is to make sure we don't assign redundant/duplicate from_well ID of the same plate type for different source.
    if (currentRowFromPlate === FROM_PLATE_DW) {
      if (previousRowSource === '' || previousRowSource === currentRowSource) {
        if (current_DW.wellValue < maxNumOfWells + current_DW.startFromWell - 1) {
          current_DW.wellValue += 1;
        } else {
          current_DW.wellValue = current_DW.startFromWell;
        }
      } else {
        // Increment from_well
        const startWellID = current_DW.wellValue === 0 ? 0 : current_DW.startFromWell;
        current_DW.wellValue = startWellID + current_DW.previousNumOfWells;
        current_DW.startFromWell = current_DW.wellValue;
      }

      object.from_well = current_DW.wellValue;
    } else {
      // Handle flat plate
      if (previousRowSource === '' || previousRowSource === currentRowSource) {
        if (current_flat.wellValue < maxNumOfWells + current_flat.startFromWell - 1) {
          current_flat.wellValue += 1;
        } else {
          current_flat.wellValue = current_flat.startFromWell;
        }
      } else {
        // Increment from_well
        const flat_startWellID = current_flat.wellValue === 0 ? 0 : current_flat.startFromWell;
        current_flat.wellValue = flat_startWellID + current_flat.previousNumOfWells;
        current_flat.startFromWell = current_flat.wellValue;
      }

      object.from_well = current_flat.wellValue;
    }

    previousRowSource = currentRowSource;
  });

  // Generate data in worklist for mixing step and aliquoting step
  if (generateAllData) {
    const mm_groupNumber = groupNumber + 1; // continue from mm step
    const mixingData = generateMixingSteps(
      listOfMastermixes,
      listOfTotalVolumesEachMM,
      mm_groupNumber,
      numOfWells
    );
    mixingData.forEach((mixing_step) => {
      data.push(mixing_step);
    });

    const aliquotingData = generateAliquotingStep(
      listOfMastermixes,
      experimentalPlanData,
      mm_groupNumber,
      numOfWells
    );
    aliquotingData.forEach((aq_step) => {
      data.push(aq_step);
    });
  }

  return data.map((object) => omit(object, ['id', 'recipeId', 'sortedKey']));
};

/**
 * Loop through each mastermix to generate data for mixing the mastermix steps.
 */
const generateMixingSteps = (
  listOfMastermixes: Mastermix[],
  listOfMixtureVolume: number[],
  groupNumber: number,
  numOfWells: number
): WorklistData[] => {
  const data: WorklistData[] = [];
  let wellId = 1;

  listOfMastermixes.forEach((mastermix, mixMMindex) => {
    // Volume_ul is 80% of the total volume of mixture (round to 1 digit)
    const volume = Math.ceil(
      Math.round(((listOfMixtureVolume[mixMMindex] * 80) / 100 + Number.EPSILON) * 10) / 10
    );

    for (let i = 0; i < numOfWells; i++) {
      const mixingStep: WorklistData = {
        step: 'mix_' + mastermix.name,
        dx: VALUE.COLUMN_B,
        dz: VALUE.COLUMN_C,
        volume_uL: volume,
        liquid_class: MIX_MM.LIQUID_CLASS,
        timer_delta: VALUE.COLUMN_F,
        source: MIX_MM.SOURCE,
        step_index: VALUE.COLUMN_H,
        destination: VALUE.COLUMN_I,
        group_number: groupNumber,
        timer_group_check: VALUE.COLUMN_K,
        guid: VALUE.COLUMN_L,
        from_path: VALUE.COLUMN_M,
        asp_mixing: MIX_MM.ASP_MIXING,
        dispense_type: MIX_MM.DISPENSE_TYPE,
        tip_type: MIX_MM.TIP_TYPE.toString(),
        touchoff_dis: VALUE.COLUMN_Q,
        to_plate: MIX_MM.TO_PLATE,
        to_well: wellId,
        from_plate: MIX_MM.FROM_PLATE,
        from_well: wellId,
      };
      data.push(mixingStep);

      wellId++;
    }
  });

  return data;
};

/**
 * Loop through each mastermix to generate data for aliquoting mastermix
 */
const generateAliquotingStep = (
  listOfMastermixes: Mastermix[],
  experimentalPlanData: NAATExperiment[],
  mm_groupNumber: number,
  numOfWells: number
): WorklistData[] => {
  const data: WorklistData[] = [];

  const masterMixVolumePerReaction = experimentalPlanData[0].mastermixVolumePerReaction;
  const aq_groupNumber = mm_groupNumber + 1;
  let aq_to_well = 1;
  const plateSize = Number(experimentalPlanData[0].pcrPlateSize); // 96 or 384
  let aq_from_well = 1;
  let start_from_well_id = 1;
  let countRow = 0;

  // Get total wells per mastermix (the result will determine how many rows to include in the worklist file)
  const totalWellsPerMastermix = getTotalWellsPerMastermix(
    experimentalPlanData[0].numOfSampleConcentrations,
    experimentalPlanData[0].numOfTechnicalReplicates
  );

  listOfMastermixes.forEach((mastermix) => {
    for (let i = 1; i <= totalWellsPerMastermix; i++) {
      countRow++;

      data.push({
        step: 'aq_' + mastermix.name,
        dx: VALUE.COLUMN_B,
        dz: VALUE.COLUMN_C,
        volume_uL: masterMixVolumePerReaction,
        liquid_class: ALIQUOTING_MM.LIQUID_CLASS,
        timer_delta: VALUE.COLUMN_F,
        source: ALIQUOTING_MM.SOURCE,
        step_index: VALUE.COLUMN_H,
        destination: VALUE.COLUMN_I,
        group_number: aq_groupNumber,
        timer_group_check: VALUE.COLUMN_K,
        guid: VALUE.COLUMN_L,
        from_path: VALUE.COLUMN_M,
        asp_mixing: ALIQUOTING_MM.ASP_MIXING,
        dispense_type: ALIQUOTING_MM.DISPENSE_TYPE,
        tip_type: ALIQUOTING_MM.TIP_TYPE.toString(),
        touchoff_dis: VALUE.COLUMN_Q,
        to_plate: getToPlate_AQ(plateSize, countRow),
        to_well: aq_to_well,
        from_plate: ALIQUOTING_MM.FROM_PLATE,
        from_well: aq_from_well,
      });

      if (aq_to_well % plateSize === 0) {
        aq_to_well = 1; // reset
      } else {
        aq_to_well++;
      }

      if (aq_from_well < numOfWells + start_from_well_id - 1) {
        aq_from_well++;
      } else {
        aq_from_well = start_from_well_id;
      }
    }

    // increment to next plate for next mastermix
    aq_from_well = start_from_well_id + numOfWells;
    start_from_well_id = aq_from_well;
  });

  return data;
};
