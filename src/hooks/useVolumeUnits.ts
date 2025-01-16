import { useQuery } from '@tanstack/react-query';
import axios from '@/api/axios';

export type VolumeUnit = {
  id: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
  lastUpdatedBy: string;
};

const fetchVolumeUnits = async (): Promise<VolumeUnit[]> => {
  const { data } = await axios.get<VolumeUnit[]>('/settings/naat/volume-units');
  return data;
};

export function useVolumeUnits() {
  return useQuery({
    queryKey: ['volume-units'],
    queryFn: fetchVolumeUnits,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
  });
}
