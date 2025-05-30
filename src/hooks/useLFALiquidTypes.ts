import { useQuery } from '@tanstack/react-query';
import axios from '@/api/axios';

export type LFALiquidType = {
  id: string;
  value: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
};

const fetchLFALiquidTypes = async (): Promise<LFALiquidType[]> => {
  const { data } = await axios.get<LFALiquidType[]>('/experiments/lfa/liquid-types');
  return data;
};

export function useLFALiquidTypes() {
  return useQuery({
    queryKey: ['lfa-liquid-types'],
    queryFn: fetchLFALiquidTypes,
  });
}
