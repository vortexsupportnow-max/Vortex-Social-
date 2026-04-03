import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  username?: string;
}

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };
const sizeClasses = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', username }) => {
  const initials = username ? username.slice(0, 2).toUpperCase() : '??';
  return src ? (
    <img
      src={src}
      alt={alt ?? username ?? 'avatar'}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white`}>
      {initials}
    </div>
  );
};
