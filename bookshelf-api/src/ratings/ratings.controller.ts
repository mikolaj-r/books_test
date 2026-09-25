import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { MyRatingDto } from './dto/my-rating.dto';
import { RatingDto, UserRatingDto } from './dto/rating.dto';
import { RatingsQueryDto } from './dto/ratings-query.dto';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('Ratings')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiNotFoundResponse({ type: ErrorResponseDto })
@Controller()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Put('books/:bookId/rating')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rate a book (create or replace own rating)',
    description:
      'One rating per user and book. Book counters are updated atomically.',
  })
  @ApiOkResponse({ type: MyRatingDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.ratingsService.upsert(user.id, bookId, dto);
  }

  @Delete('books/:bookId/rating')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove own rating of a book' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    return this.ratingsService.remove(user.id, bookId);
  }

  @Public()
  @Get('books/:bookId/ratings')
  @ApiOperation({ summary: 'List ratings and reviews of a book' })
  @ApiPaginatedResponse(RatingDto)
  findForBook(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query() query: RatingsQueryDto,
  ) {
    return this.ratingsService.findForBook(bookId, query);
  }

  @Public()
  @Get('users/:username/ratings')
  @ApiOperation({ summary: 'List ratings given by a user' })
  @ApiPaginatedResponse(UserRatingDto)
  findForUser(
    @Param('username') username: string,
    @Query() query: RatingsQueryDto,
  ) {
    return this.ratingsService.findForUser(username, query);
  }
}
