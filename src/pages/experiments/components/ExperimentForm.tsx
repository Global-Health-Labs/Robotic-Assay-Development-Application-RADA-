import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Experiment } from '@/api/experiments.api';
import { some, values } from 'lodash-es';

const formSchema = z
  .object({
    nameOfExperimentalPlan: z
      .string({
        required_error: 'Name of experimental plan is required',
      })
      .min(1, 'Name of experimental plan is required'),
    numOfSampleConcentrations: z.coerce
      .number()
      .min(1, 'Number of samples must be 1 or greater')
      .max(100, 'Number of samples cannot exceed 100')
      .int('Number of samples must be a whole number'),
    numOfTechnicalReplicates: z.coerce
      .number()
      .min(1, 'Number of technical replicates must be 1 or greater')
      .max(50, 'Number of technical replicates cannot exceed 50')
      .int('Number of technical replicates must be a whole number'),
    mastermixVolumePerReaction: z.coerce
      .number()
      .min(1, 'Mastermix volume per reaction must be 1 or greater')
      .max(200, 'Mastermix volume per reaction cannot exceed 200')
      .positive('Mastermix volume per reaction must be a positive number'),
    sampleVolumePerReaction: z.coerce
      .number()
      .min(1, 'Sample volume per reaction must be 1 or greater')
      .max(50, 'Sample volume per reaction cannot exceed 50')
      .positive('Sample volume per reaction must be a positive number'),
    pcrPlateSize: z.string({
      required_error: 'PCR plate size is required',
    }),
  })
  .superRefine((data, ctx) => {
    const totalVolume =
      (data.mastermixVolumePerReaction || 0) + (data.sampleVolumePerReaction || 0);
    if (totalVolume > 150) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total volume (mastermix + sample) cannot exceed 150 µL',
        path: ['mastermixVolumePerReaction'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total volume (mastermix + sample) cannot exceed 150 µL',
        path: ['sampleVolumePerReaction'],
      });
    }
  });

export type FormValues = z.infer<typeof formSchema>;

const PCR_PLATE_SIZES = ['96', '384'];

interface ExperimentFormProps {
  defaultValues?: Experiment;
  onSubmit: (data: FormValues, isDirty: boolean) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const getFormDefaultValues = (experiment?: Experiment): FormValues => {
  if (experiment) {
    return {
      ...experiment,
      pcrPlateSize: experiment.pcrPlateSize.toString(),
    };
  }
  return {
    nameOfExperimentalPlan: '',
    /* eslint-disable @typescript-eslint/no-explicit-any */
    numOfSampleConcentrations: '' as any,
    numOfTechnicalReplicates: '' as any,
    mastermixVolumePerReaction: '' as any,
    sampleVolumePerReaction: '' as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    pcrPlateSize: PCR_PLATE_SIZES[0],
  };
};

export function ExperimentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  mode,
}: ExperimentFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(defaultValues),
    mode: 'onChange',
  });

  const [mastermixVolumePerReaction, sampleVolumePerReaction] = useWatch({
    control: form.control,
    name: ['mastermixVolumePerReaction', 'sampleVolumePerReaction'],
  });

  useEffect(() => {
    if (mastermixVolumePerReaction && sampleVolumePerReaction) {
      form.trigger(['mastermixVolumePerReaction', 'sampleVolumePerReaction']);
    }
  }, [mastermixVolumePerReaction, sampleVolumePerReaction, form]);

  const handleSubmit = (data: FormValues) => {
    const isDirty = values(form.formState.dirtyFields).some((dirty) => dirty);
    onSubmit(data, isDirty);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nameOfExperimentalPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of Experimental Plan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter experiment name"
                  {...field}
                  onFocus={() => setFocusedField('nameOfExperimentalPlan')}
                  onBlur={() => setFocusedField(null)}
                />
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'nameOfExperimentalPlan'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                A unique name to identify your experimental plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numOfSampleConcentrations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Samples</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="[1 - 100]"
                  {...field}
                  onFocus={() => setFocusedField('numOfSampleConcentrations')}
                  onBlur={() => setFocusedField(null)}
                />
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'numOfSampleConcentrations'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Number of samples to be included in the experiment, this number should include
                controls as well
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numOfTechnicalReplicates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Replicates</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="[1 - 50]"
                  {...field}
                  onFocus={() => setFocusedField('numOfTechnicalReplicates')}
                  onBlur={() => setFocusedField(null)}
                />
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'numOfTechnicalReplicates'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Number of replicates that will be run for each condition tested
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mastermixVolumePerReaction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mastermix Volume</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="number"
                    placeholder="[1 - 200]"
                    {...field}
                    onFocus={() => setFocusedField('mastermixVolumePerReaction')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">µL</span>
                </div>
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'mastermixVolumePerReaction'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Volume of mastermix to be added into each well
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sampleVolumePerReaction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Volume</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="number"
                    placeholder="[1 - 50]"
                    {...field}
                    onFocus={() => setFocusedField('sampleVolumePerReaction')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">µL</span>
                </div>
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'sampleVolumePerReaction'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Volume of sample to be added into each well
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pcrPlateSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PCR Plate Size</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                onOpenChange={(open) => {
                  if (open) {
                    setFocusedField('pcrPlateSize');
                  } else {
                    setFocusedField(null);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plate size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PCR_PLATE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} wells
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'pcrPlateSize'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Select the number of well plates that best fit your experiment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Experiment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
