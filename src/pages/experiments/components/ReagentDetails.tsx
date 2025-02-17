import { Reagent } from '@/api/naat-experiments.api';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LiquidType } from '@/hooks/useLiquidTypes';
import { VolumeUnit } from '@/hooks/useVolumeUnits';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { isNumber } from 'lodash-es';
import { CopyPlus, Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const reagentSchema = z
  .object({
    source: z
      .string({
        required_error: 'Required',
      })
      .min(1, 'Required'),
    unit: z
      .string({
        required_error: 'Required',
      })
      .min(1, 'Required'),
    finalConcentration: z.coerce.number({
      required_error: 'Required',
      invalid_type_error: 'Must be a valid number',
    }),
    stockConcentration: z.coerce.number({
      required_error: 'Required',
      invalid_type_error: 'Must be a valid number',
    }),
    liquidType: z
      .string({
        required_error: 'Required',
      })
      .min(1, 'Required'),
  })
  .superRefine((val, ctx) => {
    const isWater = val.liquidType === 'water';

    if (isWater || !isNumber(val.finalConcentration) || !isNumber(val.stockConcentration)) {
      return true;
    }

    if (val.finalConcentration <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be greater than 0',
        path: ['finalConcentration'],
      });
    } else if (val.finalConcentration > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be less than 1000',
        path: ['finalConcentration'],
      });
    }

    if (val.stockConcentration <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be greater than 0',
        path: ['stockConcentration'],
      });
    } else if (val.stockConcentration > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be less than 1000',
        path: ['stockConcentration'],
      });
    }

    if (val.finalConcentration > val.stockConcentration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Final concentration must be less than or equal to stock concentration',
        path: ['finalConcentration'],
      });
    }

    return true;
  });

type ReagentFormValues = z.infer<typeof reagentSchema>;

interface ReagentDetailsProps {
  reagent: Reagent;
  liquidTypes: LiquidType[];
  volumeUnits: VolumeUnit[];
  canDelete?: boolean;
  onUpdate: (field: keyof ReagentFormValues, value: string | number) => void;
  onDelete: () => void;
  onClone: () => void;
  onValidationChange: (isValid: boolean) => void;
}

export function ReagentDetails({
  reagent,
  canDelete = true,
  onUpdate,
  onDelete,
  onClone,
  liquidTypes,
  volumeUnits,
  onValidationChange,
}: ReagentDetailsProps) {
  const form = useForm<ReagentFormValues>({
    resolver: zodResolver(reagentSchema),
    defaultValues: {
      source: reagent.source,
      unit: reagent.unit,
      finalConcentration: reagent.finalConcentration,
      stockConcentration: reagent.stockConcentration,
      liquidType: reagent.liquidType,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.trigger().then((isValid) => {
      onValidationChange(isValid);
    });
  }, []);

  const liquidType = form.watch('liquidType');
  const isWater = liquidType === 'water';

  useEffect(() => {
    if (isWater) {
      form.setValue('finalConcentration', 0);
      form.setValue('stockConcentration', 0);
      form.setValue('unit', 'X');
    }
  }, [isWater]);

  // Watch form validation state and bubble up changes
  useEffect(() => {
    const subscription = form.watch((values, info) => {
      if (info.name) {
        onUpdate(info.name, values[info.name] as string | number);
      }

      if (info.name === 'finalConcentration' || info.name === 'stockConcentration') {
        form.trigger('finalConcentration');
      }

      setTimeout(() => {
        onValidationChange(form.formState.isValid);
      }, 100);
    });
    return () => subscription.unsubscribe();
  }, [form, onValidationChange, onUpdate]);

  return (
    <Form {...form}>
      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,auto] gap-2">
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange} disabled={isWater}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(volumeUnits || []).map(({ unit }) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="finalConcentration"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="" disabled={isWater} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stockConcentration"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="" disabled={isWater} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="liquidType"
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(liquidTypes || []).map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClone}
            className="bg-transparent text-muted-foreground"
            title="Copy reagent"
          >
            <CopyPlus className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className={cn('bg-transparent', !canDelete && 'pointer-events-none opacity-60')}
            title="Delete reagent"
            disabled={!canDelete}
          >
            <Trash2Icon className="h-4 w-4 text-secondary" />
          </Button>
        </div>
      </div>
    </Form>
  );
}
