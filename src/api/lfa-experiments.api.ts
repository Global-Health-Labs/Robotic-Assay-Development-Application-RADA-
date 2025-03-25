import { Experiment, PaginatedResponse } from '@/api/experiment.type';
import { AssayPlateConfig, LFADeckLayout } from '@/types/lfa.types';
import { useQuery } from '@tanstack/react-query';
import axios from './axios';

export interface LFAStep {
  step: string;
  dx: number;
  dz: number;
  volume: number;
  liquidClass: string;
  time: number;
  source: string;
}

export type NewLFAExperiment = {
  name: string;
  numReplicates: number;
  deckLayoutId: string;
  assayPlateConfigId: string;
  type: 'LFA';
  useAsPreset?: boolean;
};

export type LFAExperiment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  steps?: LFAStep[];
} & Experiment &
  NewLFAExperiment;

export type LFAExperimentWithDeckLayout = LFAExperiment & {
  deckLayout: LFADeckLayout;
  assayPlateConfig: AssayPlateConfig;
};

export type LFARoboInstruction = {
  solution: string;
  plateWell: string;
  userInput: string;
  isDone: boolean;
};

export const getLFAExperimentQueryKey = (id: string) => ['lfa-experiment', id];

export const useLFAExperiment = (id: string, disabled: boolean = false) =>
  useQuery({
    queryKey: getLFAExperimentQueryKey(id),
    queryFn: () => getLFAExperiment(id!),
    enabled: !disabled,
  });

export async function getLFAExperiments(params: URLSearchParams) {
  params.append('type', 'LFA');
  const { data } = await axios.get<PaginatedResponse<LFAExperimentWithDeckLayout>>('/experiments', {
    params,
  });
  return {
    ...data,
    data: data.data.map((experiment) => {
      return { ...experiment, type: 'LFA' };
    }),
  };
}

export async function getLFAExperiment(id: string) {
  const { data } = await axios.get<LFAExperimentWithDeckLayout>(`/experiments/lfa/${id}`);
  return data;
}

export async function createLFAExperiment(data: NewLFAExperiment, presetId: string | null) {
  const response = await axios.post<LFAExperiment>('/experiments/lfa', { ...data, presetId });
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

export async function exportLFAExperiment(id: string) {
  const response = await axios.get(`/experiments/lfa/${id}/export`, {
    responseType: 'blob',
    timeout: 60000, // 1 minute timeout
  });
  return response.data;
}

export async function getLFAInstructionData(id: string) {
  const response = await axios.get<LFARoboInstruction[]>(`/experiments/lfa/${id}/instructions`, {
    timeout: 60000, // 1 minute timeout
  });
  return response.data.map((row) => {
    return { ...row, isDone: false };
  });
}

export async function getLFAPresets(): Promise<LFAExperiment[]> {
  const response = await axios.get('/experiments/lfa/presets');
  return response.data;
}

export const cloneLFAExperiment = async (experimentId: string) => {
  const response = await axios.post<LFAExperiment>(`/experiments/lfa/${experimentId}/clone`);
  return response.data;
};
