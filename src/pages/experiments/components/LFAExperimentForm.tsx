import axios from '@/api/axios';
import { LFAExperiment, NewLFAExperiment } from '@/api/lfa-experiments.api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { LFADeckLayout } from '@/types/lfa.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { values } from 'lodash-es';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DeckLayoutPreview } from './DeckLayoutPreview';

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
  useAsPreset: z.boolean().default(false),
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
      useAsPreset: false,
    };
  }

  return {
    name: experiment.name,
    deckLayoutId: experiment.deckLayoutId,
    numReplicates: experiment.numReplicates,
    useAsPreset: experiment.useAsPreset || false,
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
  const [previewLayout, setPreviewLayout] = useState<LFADeckLayout | null>(null);
  const { role } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFormDefaultValues(defaultValues),
    mode: 'onChange',
  });

  const { data: deckLayouts = [] } = useQuery({
    queryKey: ['lfa-deck-layouts'],
    queryFn: async () => {
      const response = await axios.get<LFADeckLayout[]>('/settings/lfa/deck-layouts');
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
              <div className="flex items-center gap-2">
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a deck layout" />
                    </SelectTrigger>
                    <SelectContent>
                      {deckLayouts.map((layout) => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    const layout = deckLayouts.find((l) => l.id === field.value);
                    if (layout) {
                      setPreviewLayout(layout);
                    }
                  }}
                >
                  Preview
                </Button>
              </div>
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

        {role === 'admin' && (
          <FormField
            control={form.control}
            name="useAsPreset"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use as Preset</FormLabel>
                  <FormDescription>
                    Make this experiment available as a preset for other users
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === 'create' ? 'Create Experiment' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Dialog
        open={previewLayout !== null}
        onOpenChange={(open) => !open && setPreviewLayout(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewLayout?.name}</DialogTitle>
          </DialogHeader>
          {previewLayout && <DeckLayoutPreview layout={previewLayout} />}
        </DialogContent>
      </Dialog>
    </Form>
  );
}
