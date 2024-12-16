import axios from './axios';
import { DispenseType } from '../utils/ExtractLiquidClass';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

export interface ExperimentFilters {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
}

export type NewExperiment = {
  nameOfExperimentalPlan: string;
  numOfSampleConcentrations: number;
  numOfTechnicalReplicates: number;
  mastermixVolumePerReaction: number;
  sampleVolumePerReaction: number;
  pcrPlateSize: number;
  deckLayoutId: string;
};

export type Experiment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
} & NewExperiment;

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

export interface DeckLayout {
  id: string;
  name: string;
  description: string;
  platePositions: { id: string; position: number }[];
}

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

export type ExperimentWithMastermix = Experiment & {
  mastermixes: Mastermix[];
};

export const getExperiments = async (filters: ExperimentFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.perPage) params.append('perPage', filters.perPage.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);

  const response = await axios.get<PaginatedResponse<Experiment>>('/experiments', { params });
  return response.data;
};

export const getExperiment = (id: string) =>
  axios.get<ExperimentWithMastermix>(`/experiments/${id}`).then((res) => res.data);

export const createExperiment = (data: NewExperiment) =>
  axios.post<Experiment>('/experiments', data).then((res) => res.data);

export const updateExperiment = (id: string, data: Partial<Experiment>) =>
  axios.put<Experiment>(`/experiments/${id}`, data).then((res) => res.data);

export const deleteExperiment = (id: string) =>
  axios.delete(`/experiments/${id}`).then((res) => res.data);

export const getMastermix = (experimentId: string) =>
  axios
    .get<ExperimentMastermix>(`/experiments/${experimentId}/mastermix`)
    .then((res) => res.data.mastermixes || []);

export const updateMastermix = (data: ExperimentMastermix) =>
  axios
    .put<ExperimentMastermix>(`/experiments/${data.experimentId}/mastermix`, data)
    .then((res) => res.data);

export const cloneExperiment = async (experimentId: string) => {
  const response = await axios.post<Experiment>(`/experiments/${experimentId}/clone`);
  return response.data;
};
