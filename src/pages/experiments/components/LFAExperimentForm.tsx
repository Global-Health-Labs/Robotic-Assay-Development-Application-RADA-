import { LFAExperiment, NewLFAExperiment } from '@/api/lfa-experiments.api';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { values } from 'lodash-es';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ASSAY_PLATE_CONFIGS } from './assay-plate-config';

const formSchema = z.object({
  nameOfExperimentalPlan: z
    .string({
      required_error: 'Name of experimental plan is required',
    })
    .min(1, 'Name of experimental plan is required'),
  plateConfigId: z
    .string({
      required_error: 'Plate configuration is required',
    })
    .min(1, 'Plate configuration is required'),
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
  plateName: z
    .string({
      required_error: 'Plate name is required',
    })
    .min(1, 'Plate name is required'),
  plateSize: z.enum(['96', '384'], {
    required_error: 'Plate size is required',
  }),
});

export type FormValues = z.infer<typeof formSchema>;

const PLATE_SIZES = ['96', '384'];

interface LFAExperimentFormProps {
  defaultValues?: LFAExperiment;
  onSubmit: (data: NewLFAExperiment, isDirty: boolean) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const getFormDefaultValues = (experiment?: LFAExperiment): FormValues => {
  if (experiment) {
    return {
      nameOfExperimentalPlan: experiment.nameOfExperimentalPlan,
      plateConfigId: experiment.plateConfigId || '',
      numOfSampleConcentrations: experiment.numOfSampleConcentrations,
      numOfTechnicalReplicates: experiment.numOfTechnicalReplicates,
      plateName: experiment.plateName || '',
      plateSize: experiment.plateSize?.toString() || '96',
    };
  }
  return {
    nameOfExperimentalPlan: '',
    plateConfigId: '',
    /* eslint-disable @typescript-eslint/no-explicit-any */
    numOfSampleConcentrations: '' as any,
    numOfTechnicalReplicates: '' as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    plateName: '',
    plateSize: PLATE_SIZES[0],
  };
};

export function LFAExperimentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  mode,
}: LFAExperimentFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(defaultValues),
    mode: 'onChange',
  });

  const handleSubmit = (data: FormValues) => {
    const isDirty = values(form.formState.dirtyFields).some((dirty) => dirty);
    onSubmit(data, isDirty);
  };

  const selectedConfig = ASSAY_PLATE_CONFIGS.find(
    (config) => config.id === form.watch('plateConfigId')
  );

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
                A unique name to identify your LFA experimental plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plateConfigId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Plate Configuration</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {field.value
                        ? ASSAY_PLATE_CONFIGS.find((config) => config.id === field.value)?.name
                        : 'Select plate configuration'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search plate configurations..." />
                    <CommandEmpty>No plate configuration found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {ASSAY_PLATE_CONFIGS.map((config) => (
                          <CommandItem
                            key={config.id}
                            value={config.id}
                            onSelect={() => {
                              form.setValue('plateConfigId', config.id);
                              form.setValue('plateSize', config.plateSize);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                config.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{config.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {config.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedConfig && (
                <div className="mt-2 rounded-md bg-muted p-4 text-sm">
                  <div className="mb-2 font-medium">Configuration Details:</div>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Plate Size: {selectedConfig.plateSize}-well</li>
                    <li>Max Samples: {selectedConfig.maxSamples}</li>
                    <li>Replicates per Sample: {selectedConfig.replicatesPerSample}</li>
                    <li>
                      Controls: {selectedConfig.controlWells.positiveControls.length} positive,{' '}
                      {selectedConfig.controlWells.negativeControls.length} negative
                    </li>
                  </ul>
                </div>
              )}
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'plateConfigId'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Select a predefined plate configuration for your experiment
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
                  min={1}
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
                Total number of samples to be tested
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
                  min={1}
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
                Number of replicates per sample
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter plate name"
                  {...field}
                  onFocus={() => setFocusedField('plateName')}
                  onBlur={() => setFocusedField(null)}
                />
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'plateName'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Name or identifier for the plate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plateSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Size</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plate size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="96">96-well plate</SelectItem>
                  <SelectItem value="384">384-well plate</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'plateSize'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Size of the plate to be used
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === 'create' ? 'Create Experiment' : 'Update Experiment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
