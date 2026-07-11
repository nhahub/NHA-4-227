import { useEffect, useState } from 'react';
import { Avatar } from '@heroui/react';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';

const getInitials = (user) => {
  const source = user?.displayName || user?.name || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase();
};

const resolveImageSrc = (profileImage) => {
  if (!profileImage) return '';
  const value = String(profileImage).trim().replace(/\\/g, '/');
  if (value.startsWith('http')) return value;
  if (value.startsWith('/uploads')) return `${API_ORIGIN}${value}`;
  if (value.startsWith('uploads/')) return `${API_ORIGIN}/${value}`;
  return value;
};

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const imageSrc = resolveImageSrc(user?.profileImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  return (
    <Avatar
      size={sizeMap[size] ?? 'md'}
      color="accent"
      className={className}
    >
      {imageSrc && !imageError ? (
        <Avatar.Image
          src={imageSrc}
          alt={user?.displayName || user?.name || 'User'}
          onError={() => setImageError(true)}
        />
      ) : null}
      <Avatar.Fallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
        {getInitials(user)}
      </Avatar.Fallback>
    </Avatar>
  );
};

export default UserAvatar;
