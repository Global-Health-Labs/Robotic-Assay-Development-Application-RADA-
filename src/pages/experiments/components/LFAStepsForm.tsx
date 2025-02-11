import { LFAStep, useLFAExperiment } from '@/api/lfa-experiments.api';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useLFALiquidTypes } from '@/hooks/useLFALiquidTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { size } from 'lodash-es';
import { Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const stepSchema = z.object({
  step: z.string().min(1, 'Step name is required'),
  location: z.string().min(1, 'Location is required'),
  volume: z.number().min(0, 'Volume must be a positive number'),
  liquidClass: z.string().min(1, 'Liquid type is required'),
  time: z.number().min(-1000, 'Invalid time'),
  source: z.string().min(1, 'Source is required'),
});

const formSchema = z.object({
  steps: z.array(stepSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface LFAStepsFormProps {
  onSubmit: (values: { steps: LFAStep[] }) => void;
  onBack: () => void;
  experimentId: string;
}

export function LFAStepsForm({ onSubmit, onBack, experimentId }: LFAStepsFormProps) {
  const { data: experimentData } = useLFAExperiment(experimentId);

  const plateConfig = experimentData?.deckLayout.assayPlateConfig;
  const locations = plateConfig?.locations || [];
  const steps = experimentData?.steps || [];

  const { data: liquidTypes = [] } = useLFALiquidTypes();

  const defaultStep = {
    step: '',
    location: '',
    volume: 0,
    liquidClass: '',
    time: 0,
    source: '',
  };

  // Transform incoming steps to form format (with location string instead of dx/dz)
  const initialSteps =
    size(steps) > 0
      ? steps?.map((step) => ({
          step: step.step,
          location: `${step.dx},${step.dz}`,
          volume: step.volume,
          liquidClass: step.liquidClass,
          time: step.time,
          source: step.source,
        }))
      : [defaultStep];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      steps: initialSteps,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Transform the form values to include dx and dz from the selected location
      const transformedSteps = values.steps.map((step) => {
        const [dx, dz] = step.location.split(',').map(Number);
        return {
          step: step.step,
          dx,
          dz,
          volume: step.volume,
          liquidClass: step.liquidClass,
          time: step.time,
          source: step.source,
        };
      });

      // Save steps first
      await onSubmit({ steps: transformedSteps });
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="p-6">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4 shadow">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Step {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`steps.${index}.step`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.location`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (DX, DZ)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc, i) => (
                              <SelectItem key={i} value={`${loc.dx},${loc.dz}`}>
                                DX: {loc.dx}, DZ: {loc.dz}
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
                    name={`steps.${index}.volume`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.liquidClass`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liquid Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select liquid type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {liquidTypes.map(({ value, displayName }) => (
                              <SelectItem key={value} value={value}>
                                {displayName}
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
                    name={`steps.${index}.time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`steps.${index}.source`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <div className="flex w-full justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    step: '',
                    location: '',
                    volume: 0,
                    liquidClass: '',
                    time: 0,
                    source: '',
                  })
                }
              >
                Add Step
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Save and Continue</Button>
          {/* <Button type="button" onClick={handleGenerateWorklist}>
            Generate Worklist
          </Button> */}
        </div>
      </form>
    </Form>
  );
}
