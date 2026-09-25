import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { EditionDto } from '../editions/dto/edition.dto';
import { BooksService } from './books.service';
import { BookDetailDto } from './dto/book-detail.dto';
import { BookSummaryDto } from './dto/book-summary.dto';
import { BooksQueryDto } from './dto/books-query.dto';

@ApiTags('Books')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search and browse books',
    description:
      'Filters: q (title or author name), genre (slug), author (id), yearFrom/yearTo (first publish year), minRating (average of user ratings). Sort by popularity (Open Library ratings count, default), averageRating, ratingsCount, firstPublishYear, title or createdAt.',
  })
  @ApiPaginatedResponse(BookSummaryDto)
  findMany(@Query() query: BooksQueryDto) {
    return this.booksService.findMany(query);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get book details',
    description:
      'Token is optional. When provided, myRating and myLibraryEntry are filled for the current user.',
  })
  @ApiOkResponse({ type: BookDetailDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.booksService.findOne(id, user);
  }

  @Public()
  @Get(':id/editions')
  @ApiOperation({ summary: 'List editions of a book, newest first' })
  @ApiOkResponse({ type: [EditionDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findEditions(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findEditions(id);
  }
}
