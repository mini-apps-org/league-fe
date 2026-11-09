import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/auth';

interface UserAvatarProps {
  user: User | undefined;
  className?: string;
}

// alt="" because the adjacent name already carries the identity; announcing it twice is noise.
export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.avatarUrl || undefined} alt="" />
      <AvatarFallback>{user?.name.slice(0, 1).toUpperCase() ?? '?'}</AvatarFallback>
    </Avatar>
  );
}
