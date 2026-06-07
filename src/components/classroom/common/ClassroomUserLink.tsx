import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidUserGuid } from '../../../services/messagingService';

type ClassroomUserLinkProps = {
  userId?: string | null;
  name: string;
  className?: string;
};

export function ClassroomUserLink({
  userId,
  name,
  className = '',
}: ClassroomUserLinkProps) {
  const navigate = useNavigate();

  if (!userId || !isValidUserGuid(userId)) {
    return <span className={className}>{name}</span>;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/profile/${userId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline cursor-pointer text-left font-inherit hover:text-[#5E4BC5] hover:underline focus:outline-none focus-visible:underline ${className}`}
    >
      {name}
    </button>
  );
}
