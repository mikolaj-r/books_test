import { Controller, Get, Param, Query } from '@nestjs/common';
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
import { GenreDto } from './dto/genre.dto';
import { GenresService } from './genres.service';

@ApiTags('Genres')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Public()
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  @ApiOperation({ summary: 'List all genres with book counts' })
  @ApiOkResponse({ type: [GenreDto] })
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a genre by slug' })
  @ApiOkResponse({ type: GenreDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('slug') slug: string) {
    return this.genresService.findBySlug(slug);
  }

  @Get(':slug/books')
  @ApiOperation({
    summary: 'List books in a genre',
    description: 'Accepts the same filters and sorting as GET /books.',
  })
  @ApiPaginatedResponse(BookSummaryDto)
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findBooks(@Param('slug') slug: string, @Query() query: BooksQueryDto) {
    return this.genresService.findBooks(slug, query);
  }
}
