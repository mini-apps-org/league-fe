import { cn } from 'cn';

interface HeaderMarkProps {
  tone?: 'accent' | 'ink';
  className?: string;
}

// The "8" ball mark with the design's highlight dot on its corner.
export const HeaderMark = ({ tone = 'accent', className }: HeaderMarkProps) => {
  return (
    <span
      aria-hidden
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-lg font-bold',
        'after:absolute after:-top-0.75 after:-right-0.75 after:size-2.5 after:rounded-full after:bg-highlight after:ring-2 after:ring-background',
        tone === 'accent' ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
        className,
      )}
    >
      8
    </span>
  );
};
