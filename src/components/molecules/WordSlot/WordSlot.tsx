import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Types from './WordSlot.types';

export const WordSlot = (props: Types.WordSlotProps) => {
  const { index, word, mode } = props;

  if (mode === 'editable') {
    const { isError, showError, isRestoring, onChange, onValidate, onKeyDown } = props;
    const hasError = isError && showError;

    const containerClasses = Libs.cn(
      'flex-row px-3 py-2 rounded-md border overflow-hidden relative',
      'inline-flex w-full items-center bg-transparent transition-colors',
      hasError && 'border-red-500 bg-red-500/10',
      !hasError && 'border-border hover:bg-secondary/50',
    );

    const badgeClasses = Libs.cn(
      'z-10 h-6 w-6 rounded-full flex-shrink-0 absolute left-3 top-1/2 -translate-y-1/2',
      hasError && 'bg-red-500 text-white',
      !hasError && 'bg-muted text-muted-foreground',
    );

    const inputColor = Libs.cn(
      '!border-none !bg-transparent !px-0 !pl-10 !pr-3 flex-row flex-1 min-w-0',
      hasError && '!text-red-500',
    );

    return (
      <Atoms.Container className="relative">
        <Atoms.Container className={containerClasses}>
          <Atoms.Badge variant="outline" className={badgeClasses}>
            {index + 1}
          </Atoms.Badge>
          <Atoms.Input
            id={`word-slot-input-${index + 1}`}
            value={word}
            placeholder="word"
            className={inputColor}
            onChange={(e) => onChange(index, e.target.value.toLowerCase().trim())}
            onBlur={() => onValidate(index, word)}
            onKeyDown={onKeyDown}
            disabled={isRestoring}
          />
        </Atoms.Container>
      </Atoms.Container>
    );
  }

  // readonly mode
  const { isCorrect, isError, onClear } = props;
  const canClear = word !== '';

  const containerClasses = Libs.cn(
    'flex-row px-4 py-2 rounded-md border border-dashed overflow-hidden',
    'inline-flex justify-start items-center gap-2 bg-transparent transition-colors',
    canClear && 'cursor-pointer',
    isCorrect && 'border-brand hover:bg-brand/10',
    isError && 'border-red-500 hover:bg-red-500/20',
    !isCorrect && !isError && canClear && 'hover:bg-secondary/80',
  );

  const badgeClasses = Libs.cn(
    'z-10 h-6 rounded-full w-6',
    isCorrect && 'bg-brand text-black absolute left-5 top-4',
    isError && 'bg-red-500 text-white absolute left-5 top-4',
  );

  const inputPadding = isCorrect || isError ? '!pl-11' : '!pl-6';
  const inputColor = Libs.cn(
    '!border-none !bg-transparent flex-row',
    isCorrect && '!text-brand',
    isError && '!text-red-500',
  );

  const title = canClear ? 'Click to remove this word' : '';

  const handleClick = () => {
    if (canClear) onClear(index);
  };

  return (
    <Atoms.Container className="relative">
      <Atoms.Container className={containerClasses} onClick={handleClick} title={title}>
        <Atoms.Badge variant="outline" className={badgeClasses}>
          {index + 1}
        </Atoms.Badge>
        <Atoms.Input
          value={word}
          placeholder="word"
          className={Libs.cn(inputPadding, inputColor)}
          readOnly
          onClick={(e) => {
            e.stopPropagation();
            if (canClear) onClear(index);
          }}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
};
