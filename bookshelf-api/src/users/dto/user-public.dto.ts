export class UserPublicDto {
  id!: string;
  username!: string;
  displayName!: string | null;
  avatarUrl!: string | null;
  bio!: string | null;
  createdAt!: Date;
}
