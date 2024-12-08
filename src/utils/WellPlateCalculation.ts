import { DROPDOWN_OPTIONS } from "../config/FormInputValues";

export const FROM_PLATE_DW = "ivl_96_dw_v1_0001";
export const FROM_PLATE_FLAT = "ivl_96_flat_v1_0001";

interface VolumeSourcePair {
  source: string;
  totalSourceVolumes: number;
}

export const getTotalWellsPerMastermix = (
  numOfSampleConcentration: number, 
  technicalReplicate: number
): number => {
  return numOfSampleConcentration * technicalReplicate;
}

/**
 * Calculate the value of from_plate for making mastermix step
 */
export const getFromPlate_MM = (
  totalVolumeSourcePair: VolumeSourcePair[], 
  source: string
): string => {
  let from_plate = "";

  totalVolumeSourcePair.forEach(object => {
    if (object.source === source) {
      if (object.totalSourceVolumes > 160) {
        from_plate = FROM_PLATE_DW;
      } else {
        from_plate = FROM_PLATE_FLAT;
      }
    }
  });

  return from_plate; 
}

/**
 * Calculate the value of to_plate for aliquoting step (based on PCR plate size)
 * @param pcrSize Different supported options of PCR plate size
 * @param rowNumber Index of row in the worklist (1 row = 1 well required)
 * @returns value of to_plate (in worklist file)
 */
export const getToPlate_AQ = (
  pcrSize: number, 
  rowNumber: number
): string => {
  let prefix = '';
  const id = Math.ceil(rowNumber / pcrSize);

  switch (pcrSize) {
    case DROPDOWN_OPTIONS.PCR_PLATE_SIZE[0]: // 96
      prefix = 'PCR_onCooler_000';
      break;
    case DROPDOWN_OPTIONS.PCR_PLATE_SIZE[1]: // 384
      prefix = 'ivl_384_flat_v1_000';
      break;
    /*
     * NOTE: If you need to add new PCR plate size option, you need to add new option to the array PCR_PLATE_SIZE
     * in FormInputValues.js file. Then, you can use the following code:
     * 
    case  DROPDOWN_OPTIONS.PCR_PLATE_SIZE[2]:
      prefix = '.....'; // plate name (value to display in worklist file)
      break;
     */
    default:
      prefix = 'Unknown Plate Name - ';
  }

  return prefix + id;
}
