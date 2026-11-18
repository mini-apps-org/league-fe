import { cn } from 'cn';

interface HeaderMarkProps {
  tone?: 'accent' | 'ink';
  className?: string;
}

export const HeaderMark = ({ tone = 'accent', className }: HeaderMarkProps) => {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-[10px] text-lg font-bold',
        tone === 'accent' ? 'bg-primary text-primary-foreground' : 'bg-foreground text-card',
        className,
      )}
    >
      8
    </span>
  );
};
