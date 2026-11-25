import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/format';
import type { User } from '@/types/auth';

interface UserAvatarProps {
  user: User | undefined;
  className?: string;
}

export const UserAvatar = ({ user, className }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.avatarUrl || undefined} alt="" />
      <AvatarFallback className="bg-chip text-[13px] font-semibold text-foreground">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
};
