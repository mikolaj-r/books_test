import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 'email' })
  field!: string;

  @ApiProperty({ example: ['email must be an email'] })
  messages!: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'NOT_FOUND' })
  code!: string;

  @ApiProperty({ example: 'Book not found' })
  message!: string;

  @ApiProperty({ type: [ErrorDetailDto], nullable: true })
  details!: ErrorDetailDto[] | null;

  @ApiProperty({
    example: '/api/v1/books/6d1c8e2a-1f4b-4c0e-9d7a-2b3c4d5e6f70',
  })
  path!: string;

  @ApiProperty({ example: '2026-09-25T10:00:00.000Z' })
  timestamp!: string;
}
