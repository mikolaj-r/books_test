import { User } from '../generated/prisma/client';
import { UserPrivateDto } from './dto/user-private.dto';
import { UserPublicDto } from './dto/user-public.dto';

export const toUserPublic = (user: User): UserPublicDto => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  createdAt: user.createdAt,
});

export const toUserPrivate = (user: User): UserPrivateDto => ({
  ...toUserPublic(user),
  email: user.email,
  role: user.role,
  updatedAt: user.updatedAt,
});
