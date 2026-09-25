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
import { LibraryEntryDto } from './dto/library-entry.dto';
import { LibraryQueryDto } from './dto/library-query.dto';
import { UpsertLibraryEntryDto } from './dto/upsert-library-entry.dto';
import { LibraryService } from './library.service';

@ApiTags('Library')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiNotFoundResponse({ type: ErrorResponseDto })
@Controller()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Put('me/library/:bookId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set reading status of a book',
    description:
      'READING without startedAt sets today, READ without finishedAt sets today, WANT_TO_READ clears finishedAt and currentPage.',
  })
  @ApiOkResponse({ type: LibraryEntryDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Body() dto: UpsertLibraryEntryDto,
  ) {
    return this.libraryService.upsert(user.id, bookId, dto);
  }

  @Delete('me/library/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a book from the reading library' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    return this.libraryService.remove(user.id, bookId);
  }

  @Get('me/library')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List own reading library',
    description:
      'Filter by status. Sort by updatedAt (default), finishedAt or title.',
  })
  @ApiPaginatedResponse(LibraryEntryDto)
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findMine(@CurrentUser() user: AuthUser, @Query() query: LibraryQueryDto) {
    return this.libraryService.findMine(user.id, query);
  }

  @Public()
  @Get('users/:username/library')
  @ApiOperation({ summary: 'List the reading library of a user' })
  @ApiPaginatedResponse(LibraryEntryDto)
  findByUsername(
    @Param('username') username: string,
    @Query() query: LibraryQueryDto,
  ) {
    return this.libraryService.findByUsername(username, query);
  }
}
