import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpsertReadingGoalDto {
  @ApiProperty({ minimum: 1, maximum: 1000, example: 12 })
  @IsInt()
  @Min(1)
  @Max(1000)
  targetBooks!: number;
}
