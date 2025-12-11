'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const SearchInput = ({
  placeholder = 'Search',
  value = '',
  onChange,
  onSearch,
  className,
  children,
}: SearchInputProps): React.ReactElement => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue);
    }
  };

  const handleSearchClick = (): void => {
    onSearch?.(inputValue);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  const containerClassName = Libs.cn('relative w-full', className);
  const inputClassName = Libs.cn(
    'px-6 py-6  border-border',
    isFocused && children
      ? 'rounded-t-2xl rounded-b-none border-b-0 bg-transparent'
      : 'rounded-full bg-gradient-to-b from-background via-background via-60% to-transparent',
  );
  const buttonClassName = Libs.cn(
    'border-none bg-transparent absolute right-2 top-1/2 transform text-muted-foreground -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center',
  );
  const dropdownClassName = Libs.cn(
    'p-6 absolute top-full left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent backdrop-blur-[25px] border border-t-0 border-border shadow-lg rounded-b-lg rounded-t-none max-h-96 overflow-y-auto',
  );

  return (
    <Atoms.Container data-testid="search-input" className={containerClassName}>
      <Atoms.Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputClassName}
      />

      {/* Search Button */}
      <Atoms.Button onClick={handleSearchClick} className={buttonClassName} type="button">
        <Libs.Search className="h-4 w-4" />
      </Atoms.Button>

      {/* Dropdown Card with Children */}
      {children && isFocused && <Atoms.Card className={dropdownClassName}>{children}</Atoms.Card>}
    </Atoms.Container>
  );
};
