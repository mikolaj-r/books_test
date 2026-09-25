import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { BookSummaryDto } from '../books/dto/book-summary.dto';
import { BooksQueryDto } from '../books/dto/books-query.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AuthorsService } from './authors.service';
import { AuthorDetailDto } from './dto/author-detail.dto';
import { AuthorListItemDto } from './dto/author-list-item.dto';
import { AuthorsQueryDto } from './dto/authors-query.dto';

@ApiTags('Authors')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Public()
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @ApiOperation({
    summary: 'Search authors',
    description:
      'q matches the name, case-insensitive. Sort by name (default, ascending) or booksCount (default descending).',
  })
  @ApiPaginatedResponse(AuthorListItemDto)
  findMany(@Query() query: AuthorsQueryDto) {
    return this.authorsService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get author details' })
  @ApiOkResponse({ type: AuthorDetailDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.findOne(id);
  }

  @Get(':id/books')
  @ApiOperation({
    summary: 'List books of an author',
    description: 'Accepts the same filters and sorting as GET /books.',
  })
  @ApiPaginatedResponse(BookSummaryDto)
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findBooks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BooksQueryDto,
  ) {
    return this.authorsService.findBooks(id, query);
  }
}
