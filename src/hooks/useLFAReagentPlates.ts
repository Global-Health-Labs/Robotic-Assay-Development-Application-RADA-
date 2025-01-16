import { useQuery } from '@tanstack/react-query';
import { ReagentPlate, getLFAReagentPlates } from '@/api/lfa-settings.api';

export function useLFAReagentPlates() {
  return useQuery<ReagentPlate[]>({
    queryKey: ['lfa-reagent-plates'],
    queryFn: getLFAReagentPlates,
  });
}
