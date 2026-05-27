import { cn } from '@/lib/utils';

interface MoodButtonProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
}

export function MoodButton({ label, emoji, isSelected, onClick }: MoodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl p-4 transition-all border-2 cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className={cn(
        'text-xs font-semibold text-center',
        isSelected ? 'text-primary' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </button>
  );
}
