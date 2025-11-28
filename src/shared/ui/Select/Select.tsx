import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { ChevronDownIcon, CheckIcon } from '@shared/ui/icons';
import { useClickOutside } from '@shared/lib/useClickOutside';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(selectRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={classNames('relative', className)}>
      <button
        ref={buttonRef}
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={classNames(
          'flex w-full items-center justify-between rounded-xl border bg-dark-card px-4 py-2.5 text-left text-white transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer border-dark-border hover:border-primary/50 focus:border-primary focus:ring-primary',
          isOpen && 'border-primary'
        )}
      >
        <span className={classNames('truncate', !selectedOption && 'text-gray-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={classNames(
            'ml-2 h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 min-w-full overflow-hidden rounded-xl border border-dark-border bg-dark-card/90 backdrop-blur-lg shadow-xl transition-all duration-200 ease-out'>
          <div className='py-1'>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => handleSelect(option.value)}
                  className={classNames(
                    'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-150',
                    isSelected
                      ? 'bg-primary/10 text-white'
                      : 'text-gray-300 hover:bg-dark-lighter/50 hover:text-white'
                  )}
                >
                  <span className={classNames(isSelected && 'font-medium')}>{option.label}</span>
                  {isSelected && (
                    <CheckIcon className='ml-2 h-4 w-4 flex-shrink-0 text-primary' />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

