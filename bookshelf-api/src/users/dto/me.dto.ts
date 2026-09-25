import { UserPrivateDto } from './user-private.dto';
import { UserStatsDto } from './user-stats.dto';

export class MeDto extends UserPrivateDto {
  stats!: UserStatsDto;
}
