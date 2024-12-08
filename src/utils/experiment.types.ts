export interface WorklistData {
  id?: string;
  sortedKey?: string;
  recipeId?: string;
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

export interface VolumeStep {
  volume: number;
  liquidClass: string;
  tipType: number;
}

export interface SourceKeyPair {
  source: string;
  index: number;
}

export interface VolumeSourcePair {
  source: string;
  totalSourceVolumes: number;
  index: number;
}

export interface WellTracker {
  wellValue: number;
  sampleIndex: number;
  startFromWell: number;
  previousNumOfWells: number;
}
