import { Input } from '@/components/ui/input';
import { useCallback, useState } from 'react';
import { debounce } from 'lodash-es';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchInput({
  initialValue = '',
  onSearch,
  placeholder = 'Search experiments...',
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      onSearch(searchTerm);
    }, 500),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="max-w-sm"
    />
  );
}
