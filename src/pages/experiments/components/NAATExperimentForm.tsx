import axios from '@/api/axios';
import { NAATDeckLayout, NAATExperiment, NewNAATExperiment } from '@/api/naat-experiments.api';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DeckLayoutPreview } from '@/pages/experiments/components/DeckLayoutPreview';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { values } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';

const formSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name of experimental plan is required',
      })
      .min(1, 'Name of experimental plan is required'),
    deckLayoutId: z.string({
      required_error: 'Deck layout is required',
    }),
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
    useAsPreset: z.boolean().default(false),
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
  defaultValues?: NAATExperiment;
  onSubmit: (data: NewNAATExperiment, isDirty: boolean) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const getFormDefaultValues = (experiment?: NAATExperiment): FormValues => {
  if (experiment) {
    return {
      ...experiment,
      pcrPlateSize: experiment.pcrPlateSize.toString(),
      useAsPreset: !!experiment.useAsPreset,
    };
  }
  return {
    name: '',
    /* eslint-disable @typescript-eslint/no-explicit-any */
    numOfSampleConcentrations: '' as any,
    numOfTechnicalReplicates: '' as any,
    mastermixVolumePerReaction: '' as any,
    sampleVolumePerReaction: '' as any,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    pcrPlateSize: PCR_PLATE_SIZES[0],
    deckLayoutId: '',
    useAsPreset: false,
  };
};

export function NAATExperimentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onCancel,
  mode,
}: ExperimentFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { role } = useAuth();

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
    onSubmit(
      {
        ...data,
        pcrPlateSize: Number(data.pcrPlateSize),
      },
      isDirty
    );
  };

  const { data: deckLayouts = [] } = useQuery({
    queryKey: ['naat-deck-layouts'],
    queryFn: async () => {
      const response = await axios.get<NAATDeckLayout[]>('/settings/naat/deck-layouts');
      return response.data;
    },
  });

  const [previewLayout, setPreviewLayout] = useState<NAATDeckLayout | null>(null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                A unique name to identify your experimental plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deckLayoutId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deck Layout</FormLabel>
              <div className="flex gap-2">
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
                  onClick={() => {
                    const layout = deckLayouts.find((l) => l.id === field.value);
                    if (layout) {
                      setPreviewLayout(layout);
                    }
                  }}
                  className="h-full"
                  disabled={!field.value}
                >
                  Preview
                </Button>
              </div>
              <FormDescription
                className={cn(
                  'transition-colors duration-200',
                  focusedField === 'deckLayoutId'
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                Select a deck layout for your experiment
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
              <FormControl>
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
              </FormControl>
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {mode === 'edit' ? 'Save Changes' : 'Create Experiment'}
          </Button>
        </div>
      </form>

      <Dialog open={Boolean(previewLayout)} onOpenChange={() => setPreviewLayout(null)}>
        <DialogContent className="h-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>{previewLayout?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {previewLayout?.description}
            </DialogDescription>
          </DialogHeader>
          {previewLayout && <DeckLayoutPreview layout={previewLayout} />}
        </DialogContent>
      </Dialog>
    </Form>
  );
}
