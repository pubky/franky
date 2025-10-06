type BaseWordSlotProps = {
  index: number;
  word: string;
};

type EditableWordSlotProps = BaseWordSlotProps & {
  mode: 'editable';
  isError: boolean;
  showError: boolean;
  isRestoring: boolean;
  onChange: (index: number, value: string) => void;
  onValidate: (index: number, word: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ReadOnlyWordSlotProps = BaseWordSlotProps & {
  mode: 'readonly';
  isCorrect: boolean;
  isError: boolean;
  onClear: (index: number) => void;
};

type WordSlotProps = EditableWordSlotProps | ReadOnlyWordSlotProps;

export type { BaseWordSlotProps, EditableWordSlotProps, ReadOnlyWordSlotProps, WordSlotProps };
