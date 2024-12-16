import axios from './axios';

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
}

export interface LFAStep {
  step: string;
  dx: number;
  dz: number;
  volume: number;
  liquid_class: string;
  time: number;
  source: string;
}

export type NewLFAExperiment = {
  nameOfExperimentalPlan: string;
  numOfSampleConcentrations: number;
  numOfTechnicalReplicates: number;
  plateName: string;
  plateSize: string;
  plateConfigId: string;
  type: 'LFA';
};

export type LFAExperiment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  steps?: LFAStep[];
} & NewLFAExperiment;

export async function getLFAExperiments(filters: ExperimentFilters = {}) {
  const { data } = await axios.get<PaginatedResponse<LFAExperiment>>('/experiments/lfa', {
    params: filters,
  });
  return data;
}

export async function getLFAExperiment(id: string) {
  const { data } = await axios.get<LFAExperiment>(`/experiments/lfa/${id}`);
  return data;
}

export async function createLFAExperiment(data: NewLFAExperiment) {
  const response = await axios.post<LFAExperiment>('/experiments/lfa', data);
  return response.data;
}

export async function updateLFAExperiment(id: string, data: Partial<LFAExperiment>) {
  const response = await axios.put<LFAExperiment>(`/experiments/lfa/${id}`, data);
  return response.data;
}

export async function deleteLFAExperiment(id: string) {
  await axios.delete(`/experiments/lfa/${id}`);
}

export async function getLFAExperimentSteps(id: string) {
  const { data } = await axios.get<LFAStep[]>(`/experiments/lfa/${id}/steps`);
  return data;
}

export async function updateLFAExperimentSteps(id: string, steps: LFAStep[]) {
  const response = await axios.put<LFAExperiment>(`/experiments/lfa/${id}/steps`, { steps });
  return response.data;
}
