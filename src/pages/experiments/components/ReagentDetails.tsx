import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CopyPlus, Trash2Icon } from 'lucide-react';
import React from 'react';
import { ReagentValidation } from './ValidationSchema';

interface Reagent {
  id: string;
  source: string;
  unit: string;
  finalConcentration: number;
  stockConcentration: number;
  liquidType: string;
}

interface ReagentDetailsProps {
  reagent: Reagent;
  canDelete: boolean;
  errors?: ReagentValidation;
  showValidation: boolean;
  onUpdate: (field: keyof Reagent, value: string | number) => void;
  onFieldBlur: (field: keyof Reagent) => void;
  onDelete: () => void;
  onClone: () => void;
}

const UNITS = ['µL', 'mL', 'µg', 'mg', 'ng'];
const LIQUID_TYPES = ['Water', 'Buffer', 'Sample', 'Other'];

export function ReagentDetails({
  reagent,
  onUpdate,
  onDelete,
  onClone,
  onFieldBlur,
  canDelete,
  errors = {},
  showValidation,
}: ReagentDetailsProps) {
  const [touchedFields, setTouchedFields] = React.useState<Set<keyof Reagent>>(new Set());

  const handleBlur = (field: keyof Reagent) => {
    if (!touchedFields.has(field)) {
      setTouchedFields((prev) => new Set([...prev, field]));
    }
    onFieldBlur(field);
  };

  const handleChange = (field: keyof Reagent, value: string | number) => {
    onUpdate(field, value);
    if (touchedFields.has(field)) {
      onFieldBlur(field);
    }
  };

  const showError = (field: keyof ReagentValidation) => {
    return (showValidation || touchedFields.has(field)) && errors[field];
  };

  return (
    <React.Fragment>
      <div className="flex flex-col gap-1">
        <Input
          value={reagent.source}
          onChange={(e) => handleChange('source', e.target.value)}
          onBlur={() => handleBlur('source')}
          className={cn('w-full', showError('source') && 'border-red-500')}
        />
        {showError('source') && <span className="text-xs text-red-500">{errors.source}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <Select
          value={reagent.unit}
          onValueChange={(value) => {
            handleChange('unit', value);
            handleBlur('unit');
          }}
        >
          <SelectTrigger className={cn(showError('unit') && 'border-red-500')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showError('unit') && <span className="text-xs text-red-500">{errors.unit}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="number"
          value={reagent.finalConcentration}
          onChange={(e) => handleChange('finalConcentration', parseFloat(e.target.value))}
          onBlur={() => handleBlur('finalConcentration')}
          className={cn('w-full', showError('finalConcentration') && 'border-red-500')}
        />
        {showError('finalConcentration') && (
          <span className="text-xs text-red-500">{errors.finalConcentration}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="number"
          value={reagent.stockConcentration}
          onChange={(e) => handleChange('stockConcentration', parseFloat(e.target.value))}
          onBlur={() => handleBlur('stockConcentration')}
          className={cn('w-full', showError('stockConcentration') && 'border-red-500')}
        />
        {showError('stockConcentration') && (
          <span className="text-xs text-red-500">{errors.stockConcentration}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Select
          value={reagent.liquidType}
          onValueChange={(value) => {
            handleChange('liquidType', value);
            handleBlur('liquidType');
          }}
        >
          <SelectTrigger className={cn(showError('liquidType') && 'border-red-500')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIQUID_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showError('liquidType') && (
          <span className="text-xs text-red-500">{errors.liquidType}</span>
        )}
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClone}
          className="bg-transparent"
          title="Copy reagent"
        >
          <CopyPlus className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className={cn('bg-transparent', !canDelete && 'pointer-events-none opacity-60')}
          title="Delete reagent"
        >
          <Trash2Icon className="h-4 w-4 text-secondary" />
        </Button>
      </div>
    </React.Fragment>
  );
}
