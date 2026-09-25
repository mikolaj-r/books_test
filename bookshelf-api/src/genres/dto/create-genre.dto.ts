import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Polish Literature', maxLength: 60 })
  @IsString()
  @Length(1, 60)
  name!: string;
}
