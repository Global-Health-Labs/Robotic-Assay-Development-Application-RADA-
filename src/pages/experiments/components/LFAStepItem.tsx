import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

// Maximum length for a source
const MAX_SOURCE_LENGTH = 50;

interface Location {
  name: string;
  dx: number;
  dz: number;
}

interface LiquidType {
  value: string;
  displayName: string;
}

interface LFAStepItemProps {
  index: number;
  canDelete: boolean;
  onDelete: () => void;
  locations: Location[];
  liquidTypes: LiquidType[];
  columnHeaders: Array<{ title: string; tooltip: string }>;
}

export function LFAStepItem({
  index,
  canDelete,
  onDelete,
  locations,
  liquidTypes,
  columnHeaders,
}: LFAStepItemProps) {
  // State to track sources for this step
  const [sources, setSources] = useState<string[]>([]);
  // State to track source input error
  const [sourceError, setSourceError] = useState<string | null>(null);
  // State to track current source input value
  const [currentSourceInput, setCurrentSourceInput] = useState<string>('');

  const { control, setValue, setError, watch } = useFormContext();

  const liquidClass = watch(`steps.${index}.liquidClass`);
  const isImaging = liquidClass === 'imaging';

  // Initialize sources from form value
  useEffect(() => {
    const loadSources = async () => {
      // Use a timeout to ensure the form value is available
      setTimeout(() => {
        try {
          // Get the current source value from the form
          const sourceValue = control._formValues?.steps?.[index]?.source;
          if (sourceValue) {
            // Split by comma and trim each part
            const initialSources = sourceValue
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s);
            setSources(initialSources);
          }
        } catch (error) {
          console.error('Error loading sources:', error);
        }
      }, 0);
    };

    loadSources();
  }, [control, index]);

  useEffect(() => {
    setValue(`steps.${index}.volume`, 0);
  }, [isImaging, setValue]);

  // Process input string and add sources
  const addSource = () => {
    const sourceValue = currentSourceInput?.trim();

    if (!sourceValue) {
      setSourceError('Source cannot be empty');
      return;
    }

    // Split by commas and spaces, then filter out empty parts
    const sourceParts = sourceValue
      .split(/[,\s]+/) // Split by one or more commas or spaces
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    // Check if any part is too long
    const invalidParts = sourceParts.filter((part) => part.length > MAX_SOURCE_LENGTH);
    if (invalidParts.length > 0) {
      setSourceError(`Source part exceeds maximum length of ${MAX_SOURCE_LENGTH} characters`);
      return;
    }

    // Clear error if valid
    setSourceError(null);

    // Add sources to the list
    const updatedSources = [...sources, ...sourceParts];
    setSources(updatedSources);

    // Update the form value
    setValue(`steps.${index}.source`, updatedSources.join(','));

    // Clear input
    setCurrentSourceInput('');
  };

  // Remove a source
  const removeSource = (sourceIndex: number) => {
    const updatedSources = [...sources];
    updatedSources.splice(sourceIndex, 1);

    setSources(updatedSources);

    // Update the form value
    setValue(`steps.${index}.source`, updatedSources.join(','));

    // Add error if no sources left
    if (updatedSources.length === 0) {
      setSourceError('At least one variable condition is required');
      setError(`steps.${index}.source`, {
        type: 'manual',
        message: 'At least one variable condition is required',
      });
    }
  };

  // Handle source input change
  const handleSourceInputChange = (value: string) => {
    setCurrentSourceInput(value);
  };

  // Handle key press in source input
  const handleSourceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSource();
    }
  };

  const getLocationName = (location: string) => {
    const [dx, dz] = location.split(',').map(Number);
    return locations.find((loc) => loc.dx === dx && loc.dz === dz)?.name || 'Unknown';
  };

  return (
    <div className="mastermix-container space-y-4 rounded-lg border border-zinc-200 shadow">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-2 bg-sky-50 px-4 py-2 pl-9">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Step Name</p>
            <div className="flex gap-2">
              <FormField
                control={control}
                name={`steps.${index}.step`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          'w-[200px] font-medium placeholder:text-xs placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0'
                        )}
                        placeholder="Enter step name..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="ml-auto">
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="bg-transparent"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Step Fields in Table Format */}
      <div className="grid grid-cols-[1fr,1fr,1fr,1fr] gap-2 px-4 pb-4">
        {/* Headers */}
        {columnHeaders.map(({ title, tooltip }) => (
          <div
            key={title}
            className="group relative flex cursor-help items-center gap-1 py-2 text-xs font-medium text-muted-foreground"
          >
            <span className="border-b border-dotted border-muted-foreground/50">{title}</span>
            <div className="invisible absolute bottom-full left-0 z-50 max-w-[250px] -translate-y-1 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:visible">
              {tooltip}
            </div>
          </div>
        ))}

        {/* Step Fields */}
        <FormField
          control={control}
          name={`steps.${index}.location`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location">
                      {getLocationName(field.value)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc, i) => (
                      <SelectItem key={i} value={`${loc.dx},${loc.dz}`}>
                        <div>{loc.name}</div>
                        <div className="ml-1 text-xs text-muted-foreground">
                          DX: {loc.dx}, DZ: {loc.dz}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`steps.${index}.liquidClass`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select liquid type" />
                  </SelectTrigger>
                  <SelectContent>
                    {liquidTypes.map(({ value, displayName }) => (
                      <SelectItem key={value} value={value}>
                        {displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`steps.${index}.volume`}
          disabled={isImaging}
          render={({ field }) => (
            <FormItem>
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
          control={control}
          name={`steps.${index}.time`}
          render={({ field }) => (
            <FormItem>
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
      </div>

      {/* Sources Section */}
      <div className="px-4 pb-4">
        <div className="group relative flex cursor-help items-center gap-1 py-2 text-xs font-medium text-muted-foreground">
          <span className="border-b border-dotted border-muted-foreground/50">
            Variable Conditions
          </span>
          <div className="invisible absolute bottom-full left-0 z-50 max-w-[250px] -translate-y-1 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md group-hover:visible">
            Add one or more variable conditions for this step. Enter multiple variables separated by
            spaces or commas. Each variable can be at most 50 characters.
          </div>
        </div>

        {/* Hidden field to store the actual comma-separated sources */}
        <FormField
          control={control}
          name={`steps.${index}.source`}
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source chips display */}
        <div className="mb-2 flex flex-wrap gap-2">
          {sources.map((source, sourceIndex) => (
            <div
              key={sourceIndex}
              className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sm"
            >
              <span>{source}</span>
              <button
                type="button"
                onClick={() => removeSource(sourceIndex)}
                className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-sky-200 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Source input and add button */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={currentSourceInput}
              onChange={(e) => handleSourceInputChange(e.target.value)}
              onKeyDown={handleSourceKeyPress}
              placeholder="Enter Variable Conditions (separate multiple with spaces or commas)..."
              className={cn(sourceError && 'border-red-500')}
            />
            {sourceError && <p className="mt-1 text-xs text-destructive">{sourceError}</p>}
          </div>
          <Button type="button" onClick={addSource} variant="outline">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
