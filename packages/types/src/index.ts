// User
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'moderator' | 'member' | 'guest';

// Community
export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  isPrivate: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  role: UserRole;
  joinedAt: Date;
}

// Channel
export type ChannelType = 'text' | 'voice';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  communityId: string;
  topic?: string;
  createdAt: Date;
}

// Post
export interface Post {
  id: string;
  content: string;
  mediaUrls?: string[];
  authorId: string;
  communityId: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
  createdAt: Date;
}

// Message
export interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId?: string;
  dmRecipientId?: string;
  createdAt: Date;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
