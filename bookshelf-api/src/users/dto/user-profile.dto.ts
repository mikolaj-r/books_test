import { UserPublicDto } from './user-public.dto';
import { UserStatsDto } from './user-stats.dto';

export class UserProfileDto extends UserPublicDto {
  stats!: UserStatsDto;
}
