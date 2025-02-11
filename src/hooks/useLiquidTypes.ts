import { useQuery } from '@tanstack/react-query';
import axios from '@/api/axios';

export type LiquidType = {
  id: string;
  value: string;
  displayName: string;
  needsTipWashing: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
};

const fetchLiquidTypes = async (): Promise<LiquidType[]> => {
  const { data } = await axios.get<LiquidType[]>('/settings/naat/liquid-types');
  return data;
};

export function useLiquidTypes() {
  return useQuery({
    queryKey: ['naat-liquid-types'],
    queryFn: fetchLiquidTypes,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
