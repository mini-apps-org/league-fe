import { cn } from 'cn';

interface SkillLevelSquareProps {
  skillLevel: number;
  className?: string;
}

// Appears in every roster, candidate and scoresheet row, so it is one component rather than
// a repeated class string.
export default function SkillLevelSquare({ skillLevel, className }: SkillLevelSquareProps) {
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
