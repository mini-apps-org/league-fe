import { head, isEmpty, last, toUpper, words } from 'lodash-es';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/auth';

interface UserAvatarProps {
  user: User | undefined;
  className?: string;
}

const getInitials = (name: string | undefined): string => {
  const nameParts = words(name, /\S+/g);
  const initialParts = nameParts.length > 1 ? [head(nameParts), last(nameParts)] : nameParts;
  const initials = toUpper(initialParts.map((part) => part?.charAt(0)).join(''));

  return isEmpty(initials) ? '?' : initials;
};

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
