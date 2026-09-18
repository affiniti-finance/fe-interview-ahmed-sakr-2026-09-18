interface EnumSelectProps<T extends string> {
  id?: string;
  className?: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (next: T) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * A single-select over one of the domain unions. The cast is safe because the
 * options come from the same `Record` the labels do.
 */
export function EnumSelect<T extends string>({
  id,
  className = 'field-control',
  value,
  options,
  labels,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: EnumSelectProps<T>) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  );
}
