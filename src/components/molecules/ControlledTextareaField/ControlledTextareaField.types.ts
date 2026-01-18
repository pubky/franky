import { Control, FieldValues, Path } from 'react-hook-form';

export interface ControlledTextareaFieldProps<T extends FieldValues> {
  /** Field name that corresponds to a key in the form schema */
  name: Path<T>;
  /** React Hook Form control object */
  control: Control<T>;
  /** Label text displayed above the textarea */
  label: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Textarea border style variant */
  variant?: 'default' | 'dashed';
  /** Number of visible text rows */
  rows?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the textarea element */
  textareaClassName?: string;
}
