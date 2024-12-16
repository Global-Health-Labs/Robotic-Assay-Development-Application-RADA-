import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { ASSAY_PLATE_CONFIGS } from './assay-plate-config';
import { generateWorklistFiles } from '@/lib/lfa-worklist-generator';
import { toast } from 'sonner';

const stepSchema = z.object({
  step: z.string().min(1, 'Step name is required'),
  location: z.string().min(1, 'Location is required'),
  volume: z.number().min(0, 'Volume must be non-negative'),
  liquid_class: z.string().min(1, 'Liquid class is required'),
  time: z.number(),
  source: z.string().min(1, 'Source is required'),
});

const formSchema = z.object({
  steps: z.array(stepSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface LFAStepsFormProps {
  onSubmit: (values: {
    steps: Array<{
      step: string;
      dx: number;
      dz: number;
      volume: number;
      liquid_class: string;
      time: number;
      source: string;
    }>;
  }) => void;
  onBack: () => void;
  plateConfigId?: string;
  steps?: Array<{
    step: string;
    dx: number;
    dz: number;
    volume: number;
    liquid_class: string;
    time: number;
    source: string;
  }>;
}

const liquidClasses = ['water', 'pbst', 'imaging'];

export function LFAStepsForm({
  onSubmit,
  onBack,
  plateConfigId = 'lfa-96-standard',
  steps,
}: LFAStepsFormProps) {
  const plateConfig = ASSAY_PLATE_CONFIGS.find((config) => config.id === plateConfigId);
  const locations = plateConfig?.locations || [];

  const defaultStep = {
    step: '',
    location: '',
    volume: 0,
    liquid_class: '',
    time: 0,
    source: '',
  };

  // Transform incoming steps to form format (with location string instead of dx/dz)
  const initialSteps = steps?.map((step) => ({
    step: step.step,
    location: `${step.dx},${step.dz}`,
    volume: step.volume,
    liquid_class: step.liquid_class,
    time: step.time,
    source: step.source,
  })) || [defaultStep];

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
          liquid_class: step.liquid_class,
          time: step.time,
          source: step.source,
        };
      });

      console.log('Transformed Steps:', transformedSteps);

      // Save steps first
      await onSubmit({ steps: transformedSteps });
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  const handleGenerateWorklist = () => {
    const values = form.getValues();
    const steps = values.steps.map((step) => {
      const [dx, dz] = step.location.split(',').map(Number);
      return {
        step: step.step,
        dx,
        dz,
        volume: step.volume,
        liquid_class: step.liquid_class,
        time: step.time,
        source: step.source,
      };
    });

    // Create PlateConfig from AssayPlateConfig
    const worklistPlateConfig = {
      prefix: plateConfig?.assayPlate.name || 'IVL_Plate',
      numPlates: plateConfig?.assayPlate.numPlates || 1,
      numStripsPerPlate: plateConfig?.assayPlate.numStrips || 96,
      numColumns: plateConfig?.assayPlate.numColumns || 6,
      sourcePlates: {
        'ivl_384_flat_v1': {
          name: 'ivl_384_flat_v1',
          wellCount: 384,
          holdoverVolume: 10,
          wellVolume: 100
        },
        'ivl_96_dw_v1': {
          name: 'ivl_96_dw_v1',
          wellCount: 96,
          holdoverVolume: 50,
          wellVolume: 1000
        }
      },
      name: plateConfig?.name || 'LFA Standard',
      wellCount: plateConfig?.assayPlate.numStrips || 96
    };

    try {
      const { worklistCsv, userSolutionCsv } = generateWorklistFiles(steps, worklistPlateConfig, {
        numReplicates: plateConfig?.replicatesPerSample || 1,
        stripsPerGroup: 8,
        reverseVariableOrder: false,
        dispenseType: 'jet_empty',
        aspirationMixing: true,
        zeroFill: 2,
        sortByColumn: false
      });

      // Create and download worklist CSV
      const worklistBlob = new Blob([worklistCsv], { type: 'text/csv' });
      const worklistUrl = window.URL.createObjectURL(worklistBlob);
      const worklistLink = document.createElement('a');
      worklistLink.href = worklistUrl;
      worklistLink.setAttribute('download', 'worklist.csv');
      document.body.appendChild(worklistLink);
      worklistLink.click();
      document.body.removeChild(worklistLink);

      // Create and download user solution CSV
      const userSolutionBlob = new Blob([userSolutionCsv], { type: 'text/csv' });
      const userSolutionUrl = window.URL.createObjectURL(userSolutionBlob);
      const userSolutionLink = document.createElement('a');
      userSolutionLink.href = userSolutionUrl;
      userSolutionLink.setAttribute('download', 'user_solutions.csv');
      document.body.appendChild(userSolutionLink);
      userSolutionLink.click();
      document.body.removeChild(userSolutionLink);

      toast.success('Worklist files generated successfully');
    } catch (error) {
      console.error('Error generating worklist files:', error);
      toast.error('Error generating worklist files');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Step {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    name={`steps.${index}.liquid_class`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liquid Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select liquid class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {liquidClasses.map((lc) => (
                              <SelectItem key={lc} value={lc}>
                                {lc}
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

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  step: '',
                  location: '',
                  volume: 0,
                  liquid_class: '',
                  time: 0,
                  source: '',
                })
              }
            >
              Add Step
            </Button>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Save and Continue</Button>
          <Button type="button" onClick={handleGenerateWorklist}>
            Generate Worklist
          </Button>
        </div>
      </form>
    </Form>
  );
}
