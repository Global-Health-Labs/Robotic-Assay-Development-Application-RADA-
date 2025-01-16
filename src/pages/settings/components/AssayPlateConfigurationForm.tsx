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

const locationSchema = z.object({
  dx: z.number().min(0, 'X offset must be non-negative'),
  dz: z.number().min(0, 'Z offset must be non-negative'),
});

const configSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  assayPlatePrefix: z.string().min(1, 'Plate prefix is required'),
  numPlates: z.number().min(1, 'Must have at least 1 plate'),
  numStrips: z.number().min(1, 'Must have at least 1 strip'),
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
      numPlates: config?.numPlates ?? 1,
      numStrips: config?.numStrips ?? 1,
      numColumns: config?.numColumns ?? 1,
      locations: config?.locations ?? [{ dx: 0, dz: 0 }], // Default to one location
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numStrips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Strips</FormLabel>
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
                name="numColumns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Columns</FormLabel>
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
                  onClick={() => append({ dx: 0, dz: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
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
