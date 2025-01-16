import { LFAExperiment, NewLFAExperiment } from '@/api/lfa-experiments.api';
import { getLFAConfigs } from '@/api/lfa-settings.api';
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
import { cn } from '@/lib/utils';
import { AssayPlateConfig } from '@/types/lfa.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { values } from 'lodash-es';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z
    .string({
      required_error: 'Name of experimental plan is required',
    })
    .min(1, 'Name of experimental plan is required'),
  plateConfigId: z
    .string({
      required_error: 'Plate configuration is required',
    })
    .min(1, 'Plate configuration is required'),
  numReplicates: z.coerce
    .number()
    .min(1, 'Number of technical replicates must be 1 or greater')
    .max(50, 'Number of technical replicates cannot exceed 50')
    .int('Number of technical replicates must be a whole number'),
});

export type FormValues = z.infer<typeof formSchema>;

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
      name: experiment.name,
      plateConfigId: experiment.plateConfigId || '',
      numReplicates: experiment.numReplicates,
    };
  }
  return {
    name: '',
    plateConfigId: '',
    /* eslint-disable @typescript-eslint/no-explicit-any */
    numReplicates: '' as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
  const { data: configs = [], isLoading } = useQuery<AssayPlateConfig[]>({
    queryKey: ['assayPlateConfigs'],
    queryFn: getLFAConfigs,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(defaultValues),
    mode: 'onChange',
  });

  const handleSubmit = (data: FormValues) => {
    const isDirty = values(form.formState.dirtyFields).some((dirty) => dirty);
    onSubmit({ ...data, type: 'LFA' }, isDirty);
  };

  const selectedConfig = configs.find((config) => config.id === form.watch('plateConfigId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of Experimental Plan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter experiment name"
                  {...field}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </FormControl>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'name' ? 'text-muted-foreground' : 'text-muted-foreground/50'
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
                      aria-expanded={open}
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {isLoading
                        ? 'Loading configurations...'
                        : field.value
                          ? configs.find((config) => config.id === field.value)?.name
                          : 'Select plate configuration'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search configurations..." />
                    <CommandList>
                      <CommandEmpty>No configurations found.</CommandEmpty>
                      <CommandGroup>
                        {configs.map((config) => (
                          <CommandItem
                            key={config.id}
                            value={config.id}
                            onSelect={() => {
                              form.setValue('plateConfigId', config.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                config.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div>
                              <div>{config.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {config.description}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
              {selectedConfig && (
                <div className="mt-2 rounded-md bg-muted p-4 text-sm">
                  <div className="mb-2 font-medium">Configuration Details:</div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      <div>Number of Plates</div>
                      <div>Strips per Plate</div>
                      <div>Number of Columns</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div>{selectedConfig.numPlates}</div>
                      <div>{selectedConfig.numStrips}</div>
                      <div>{selectedConfig.numColumns}</div>
                    </div>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numReplicates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Replicates</FormLabel>
              <FormControl>
                <Input
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
