import { Experiment, PaginatedResponse } from '@/api/experiment.type';
import { PlateItem } from '@/types/plate.types';
import { DispenseType } from '../utils/ExtractLiquidClass';
import axios from './axios';

export type NewNAATExperiment = {
  name: string;
  numOfSampleConcentrations: number;
  numOfTechnicalReplicates: number;
  mastermixVolumePerReaction: number;
  sampleVolumePerReaction: number;
  mixingStepLiquidType: string;
  aqStepLiquidType: string;
  pcrPlateSize: number;
  deckLayoutId: string;
  useAsPreset?: boolean;
};

export type NAATExperiment = {
  type: 'NAAT';
} & Experiment &
  NewNAATExperiment;

export interface Reagent {
  id: string;
  source: string;
  unit: string;
  finalConcentration: number;
  stockConcentration: number;
  liquidType: string;
  orderIndex?: number;
  mastermixId?: string;
  dispenseType?: DispenseType;
  tipWashing?: 'Yes' | 'No';
}

export type NAATDeckLayout = {
  id: string;
  name: string;
  description: string;
  platePositions: PlateItem[];
};

// export interface Reagent {
//   id: string;
//   source: string;
//   unit: string;
//   finalConcentration: number;
//   stockConcentration: number;
//   liquidType: string;
// }

// export interface Mastermix {
//   id: string;
//   name: string;
//   reagents: Reagent[];
// }

export interface Mastermix {
  id: string;
  name: string;
  reagents: Reagent[];
}

export interface ExperimentMastermix {
  experimentId: string;
  mastermixes: Mastermix[];
}

export type NAATExperimentWithMastermix = NAATExperiment & {
  mastermixes: Mastermix[];
  deckLayout: NAATDeckLayout;
};

export const getNAATExperiments = async (params: URLSearchParams) => {
  params.append('type', 'NAAT');

  const response = await axios.get<PaginatedResponse<NAATExperiment>>('/experiments', { params });
  return {
    ...response.data,
    data: response.data.data.map((experiment) => {
      return { ...experiment, type: 'NAAT' };
    }),
  };
};

export const getNAATExperiment = (id: string) =>
  axios.get<NAATExperimentWithMastermix>(`/experiments/naat/${id}`).then((res) => res.data);

export const createNAATExperiment = (data: NewNAATExperiment, presetId: string | null) =>
  axios.post<NAATExperiment>('/experiments/naat', { ...data, presetId }).then((res) => res.data);

export const updateNAATExperiment = (id: string, data: Partial<NAATExperiment>) =>
  axios.put<NAATExperiment>(`/experiments/naat/${id}`, data).then((res) => res.data);

export const deleteNAATExperiment = (id: string) =>
  axios.delete(`/experiments/naat/${id}`).then((res) => res.data);

export const getMastermix = (experimentId: string) =>
  axios
    .get<ExperimentMastermix>(`/experiments/naat/${experimentId}/mastermix`)
    .then((res) => res.data.mastermixes || []);

export const updateMastermix = (data: ExperimentMastermix) =>
  axios
    .put<ExperimentMastermix>(`/experiments/naat/${data.experimentId}/mastermix`, data)
    .then((res) => res.data);

export const cloneNAATExperiment = async (experimentId: string) => {
  const response = await axios.post<NAATExperiment>(`/experiments/naat/${experimentId}/clone`);
  return response.data;
};

export async function getNAATPresets(): Promise<NAATExperiment[]> {
  const response = await axios.get('/experiments/naat/presets');
  return response.data;
}
