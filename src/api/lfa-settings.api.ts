import { AssayPlateConfig } from '@/types/lfa.types';
import axios from './axios';

export type CreateAssayPlateConfig = Omit<AssayPlateConfig, 'id'>;

export interface LFALiquidType {
  id: string;
  value: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
}

export type CreateLFALiquidType = Pick<LFALiquidType, 'value' | 'displayName'>;

export interface ReagentPlate {
  id: string;
  plate: string;
  volumeWell: number;
  numRows: number;
  numCols: number;
  volumeHoldover: number;
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
}

export type CreateReagentPlate = Pick<
  ReagentPlate,
  'plate' | 'volumeWell' | 'numRows' | 'numCols' | 'volumeHoldover'
>;

export async function getLFAConfigs() {
  const response = await axios.get<AssayPlateConfig[]>('/settings/lfa/assay-plate-configs');
  return response.data;
}

export async function createLFAConfig(config: CreateAssayPlateConfig) {
  const response = await axios.post<AssayPlateConfig>('/settings/lfa/assay-plate-configs', config);
  return response.data;
}

export async function updateLFAConfig(id: string, config: CreateAssayPlateConfig) {
  const response = await axios.put<AssayPlateConfig>(
    `/settings/lfa/assay-plate-configs/${id}`,
    config
  );
  return response.data;
}

export async function deleteLFAConfig(id: string) {
  await axios.delete(`/settings/lfa/assay-plate-configs/${id}`);
}

export async function getLFALiquidTypes() {
  const response = await axios.get<LFALiquidType[]>('/experiments/lfa/liquid-types');
  return response.data;
}

export async function createLFALiquidType(liquidType: CreateLFALiquidType) {
  const response = await axios.post<LFALiquidType>('/settings/lfa/liquid-types', liquidType);
  return response.data;
}

export async function updateLFALiquidType(id: string, liquidType: CreateLFALiquidType) {
  const response = await axios.put<LFALiquidType>(`/settings/lfa/liquid-types/${id}`, liquidType);
  return response.data;
}

export async function deleteLFALiquidType(id: string) {
  await axios.delete(`/settings/lfa/liquid-types/${id}`);
}

export async function getLFAReagentPlates() {
  const response = await axios.get<ReagentPlate[]>('/settings/lfa/reagent-plates');
  return response.data;
}

export async function createLFAReagentPlate(reagentPlate: CreateReagentPlate) {
  const response = await axios.post<ReagentPlate>('/settings/lfa/reagent-plates', reagentPlate);
  return response.data;
}

export async function updateLFAReagentPlate(id: string, reagentPlate: CreateReagentPlate) {
  const response = await axios.put<ReagentPlate>(
    `/settings/lfa/reagent-plates/${id}`,
    reagentPlate
  );
  return response.data;
}

export async function deleteLFAReagentPlate(id: string) {
  await axios.delete(`/settings/lfa/reagent-plates/${id}`);
}
