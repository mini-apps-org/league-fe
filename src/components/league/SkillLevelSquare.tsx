import { cn } from 'cn';

interface SkillLevelSquareProps {
  skillLevel: number;
  className?: string;
}

// Appears in every roster and scoresheet row, so it is a component, not a repeated class.
export function SkillLevelSquare({ skillLevel, className }: SkillLevelSquareProps) {
  return (
    <span
      className={cn(
        'tabular inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-chip font-medium',
        className,
      )}
    >
      {skillLevel}
    </span>
  );
}
