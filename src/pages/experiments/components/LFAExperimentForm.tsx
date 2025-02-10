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
import { cn } from '@/lib/utils';
import { DeckLayout } from '@/types/lfa.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import axios from '@/api/axios';
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
  deckLayoutId: z
    .string({
      required_error: 'Deck layout is required',
    })
    .min(1, 'Deck layout is required'),
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

function getFormDefaultValues(experiment?: LFAExperiment): FormValues {
  if (!experiment) {
    return {
      name: '',
      deckLayoutId: '',
      numReplicates: 1,
    };
  }

  return {
    name: experiment.name,
    deckLayoutId: experiment.deckLayoutId,
    numReplicates: experiment.numReplicates,
  };
}

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

  const { data: deckLayouts = [], isLoading: isLoadingDeckLayouts } = useQuery<DeckLayout[]>({
    queryKey: ['lfaDeckLayouts'],
    queryFn: async () => {
      const response = await axios.get('/experiments/lfa/deck-layouts');
      return response.data;
    },
  });

  function onFormSubmit(data: FormValues) {
    const isDirty = values(form.formState.dirtyFields).some((dirty) => dirty);
    onSubmit({ ...data, type: 'LFA' }, isDirty);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
          name="deckLayoutId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deck Layout</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn('justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {isLoadingDeckLayouts
                        ? 'Loading configurations...'
                        : field.value
                          ? deckLayouts.find((layout) => layout.id === field.value)?.name
                          : 'Select deck layout'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search deck layouts..." />
                    <CommandList>
                      <CommandEmpty>No deck layouts found.</CommandEmpty>
                      <CommandGroup>
                        {values(deckLayouts).map((layout) => (
                          <CommandItem
                            value={layout.name}
                            key={layout.id}
                            onSelect={() => {
                              form.setValue('deckLayoutId', layout.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                layout.id === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {layout.name}
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
                Select a deck layout to use for this experiment.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numReplicates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Technical Replicates</FormLabel>
              <FormControl>
                <Input
                  min={1}
                  {...field}
                  onFocus={() => setFocusedField('numReplicates')}
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === 'create' ? 'Create Experiment' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
