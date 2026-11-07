import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/auth';

// alt="" because the adjacent name already carries the identity; announcing it twice is noise.
export default function UserAvatar({
  user,
  className,
}: {
  user: User | undefined;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.avatarUrl || undefined} alt="" />
      <AvatarFallback>{user?.name.slice(0, 1).toUpperCase() ?? '?'}</AvatarFallback>
    </Avatar>
  );
}
