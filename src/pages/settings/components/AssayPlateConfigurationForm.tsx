import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AssayPlateConfig } from '@/types/lfa.types';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  dx: z.number().min(0, 'X offset must be non-negative'),
  dz: z.number().min(0, 'Z offset must be non-negative'),
});

const configSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  assayPlatePrefix: z.string().min(1, 'Plate prefix is required'),
  deviceType: z.enum(['Strip', 'Cassette'], {
    required_error: 'Device type is required',
  }),
  numPlates: z.number().min(1, 'Must have at least 1 plate'),
  numRows: z.number().min(1, 'Must have at least 1 row'),
  numColumns: z.number().min(1, 'Must have at least 1 column'),
  locations: z.array(locationSchema).min(1, 'At least one location is required'),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

interface AssayPlateConfigurationFormProps {
  config?: AssayPlateConfig;
  onSubmit: (values: ConfigFormValues) => void;
  onCancel: () => void;
}

export function AssayPlateConfigurationForm({
  config,
  onSubmit,
  onCancel,
}: AssayPlateConfigurationFormProps) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      id: config?.id ?? crypto.randomUUID(),
      name: config?.name ?? '',
      description: config?.description ?? '',
      assayPlatePrefix: config?.assayPlatePrefix ?? '',
      deviceType: config?.deviceType ?? 'Strip',
      numPlates: config?.numPlates ?? 1,
      numRows: config?.numRows ?? 1,
      numColumns: config?.numColumns ?? 1,
      locations: config?.locations ?? [{ name: '', dx: 0, dz: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'locations',
  });

  // Prevent removing the last location
  const handleRemove = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      // toast.error('At least one location is required');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config ? 'Edit Configuration' : 'New Configuration'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assayPlatePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Prefix</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Strip">Strip</SelectItem>
                        <SelectItem value="Cassette">Cassette</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="numPlates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Plates</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numRows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Rows</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numColumns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Columns</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Locations</Label>
                  <p className="text-sm text-muted-foreground">At least one location is required</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', dx: 0, dz: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4">
                  <FormField
                    control={form.control}
                    name={`locations.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`locations.${index}.dx`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DX</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`locations.${index}.dz`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DZ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(+e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-center"
                    onClick={() => handleRemove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.locations?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.locations.root.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
