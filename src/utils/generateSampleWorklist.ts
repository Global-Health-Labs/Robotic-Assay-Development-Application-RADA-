import { VALUE, SAMPLE_MM } from '../config/worklist/DefaultValues';
import { getTotalWellsPerMastermix, getToPlate_AQ } from './WellPlateCalculation';
import { NAATExperiment, Mastermix } from '@/api/naat-experiments.api';

interface WorklistData {
  step: string;
  dx: number;
  dz: number;
  volume_uL: number;
  liquid_class: string;
  timer_delta: number;
  source: string;
  step_index: number;
  destination: number;
  group_number: number;
  timer_group_check: number;
  guid: number;
  from_path: string;
  asp_mixing: number;
  dispense_type: string;
  tip_type: string;
  touchoff_dis: number;
  to_plate: string;
  to_well: number;
  from_plate: string;
  from_well: number;
}

/**
 * This function is to used to perform calculations to generate sample data file in CSV format.
 * Note that this function is meant to be called only if the worklist is successfully generated.
 */
export const getSampleWorklistData = (
  listOfMastermixes: Mastermix[],
  experimentalPlanData: NAATExperiment[]
): WorklistData[] => {
  const experiment = experimentalPlanData[0];
  const data: WorklistData[] = [];
  const totalNumOfMastermixes = listOfMastermixes.length;
  const plateSize = Number(experiment.pcrPlateSize); // 96 or 364
  let groupNumber = 1;
  let toWell = 1;
  let fromWell = 1;
  let countRow = 0;

  // Get total wells per mastermix (the result will determine how many rows to include in the worklist file)
  const numOfSampleConcentration = experiment.numOfSampleConcentrations;
  const totalWellsPerMastermix = getTotalWellsPerMastermix(
    numOfSampleConcentration,
    experiment.numOfTechnicalReplicates
  );
  const sampleVolumePerReaction_uL = experiment.sampleVolumePerReaction;

  // Create list of source based on number of sample concentrations
  const listOfSources = Array.from(
    { length: numOfSampleConcentration },
    (_, i) => `sample${i < 9 ? '0' + i : i}`
  ); // Expected output: sample00, sample01 -etc

  // Create the full list of sources for all wells
  const sampleListOfSources: string[] = [];
  let currentSourceIndex = 0;

  for (let j = 0; j < totalWellsPerMastermix * totalNumOfMastermixes; j++) {
    sampleListOfSources.push(listOfSources[currentSourceIndex]);
    currentSourceIndex = (currentSourceIndex + 1) % listOfSources.length;
  }

  // Generate sample worklist data for each mastermix
  listOfMastermixes.forEach(() => {
    for (let k = 1; k <= totalWellsPerMastermix; k++) {
      countRow++;

      data.push({
        step: SAMPLE_MM.STEP,
        dx: VALUE.COLUMN_B,
        dz: VALUE.COLUMN_C,
        volume_uL: sampleVolumePerReaction_uL,
        liquid_class: SAMPLE_MM.getLiquidClass(
          experiment.aqStepSampleLiquidType,
          sampleVolumePerReaction_uL
        ),
        timer_delta: VALUE.COLUMN_F,
        source: sampleListOfSources[countRow - 1],
        step_index: VALUE.COLUMN_H,
        destination: VALUE.COLUMN_I,
        group_number: groupNumber,
        timer_group_check: VALUE.COLUMN_K,
        guid: VALUE.COLUMN_L,
        from_path: VALUE.COLUMN_M,
        asp_mixing: SAMPLE_MM.ASP_MIXING,
        dispense_type: SAMPLE_MM.DISPENSE_TYPE,
        tip_type: SAMPLE_MM.TIP_TYPE.toString(),
        touchoff_dis: VALUE.COLUMN_Q,
        to_plate: getToPlate_AQ(plateSize, countRow),
        to_well: toWell,
        from_plate: SAMPLE_MM.FROM_PLATE,
        from_well: fromWell,
      });

      // Assign to_well value
      toWell = (toWell % plateSize) + 1;

      // Assign from_well value: 1 --> Number of Sample Concentrations
      fromWell = (fromWell % numOfSampleConcentration) + 1;

      // Assign group number value
      if (countRow % plateSize === 0) {
        groupNumber++; // increment groupNumber every plate size step
      }
    }
  });

  return data;
};
