import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
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
import { CreateShelfDto } from './dto/create-shelf.dto';
import { ShelfBooksQueryDto } from './dto/shelf-books-query.dto';
import { ShelfBookDto, ShelfDto } from './dto/shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { ShelvesService } from './shelves.service';

@ApiTags('Shelves')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiNotFoundResponse({ type: ErrorResponseDto })
@Controller()
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Get('me/shelves')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List own shelves' })
  @ApiOkResponse({ type: [ShelfDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findMine(@CurrentUser() user: AuthUser) {
    return this.shelvesService.findMine(user.id);
  }

  @Post('me/shelves')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shelf' })
  @ApiCreatedResponse({ type: ShelfDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShelfDto) {
    return this.shelvesService.create(user.id, dto);
  }

  @Patch('me/shelves/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own shelf' })
  @ApiOkResponse({ type: ShelfDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShelfDto,
  ) {
    return this.shelvesService.update(user.id, id, dto);
  }

  @Delete('me/shelves/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own shelf' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shelvesService.remove(user.id, id);
  }

  @Put('me/shelves/:id/books/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a book to own shelf (idempotent)' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  addBook(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    return this.shelvesService.addBook(user.id, id, bookId);
  }

  @Delete('me/shelves/:id/books/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a book from own shelf (idempotent)' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  removeBook(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ) {
    return this.shelvesService.removeBook(user.id, id, bookId);
  }

  @Public()
  @Get('shelves/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a shelf',
    description:
      'Token is optional. Private shelves are visible only to their owner.',
  })
  @ApiOkResponse({ type: ShelfDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.shelvesService.findOne(id, user);
  }

  @Public()
  @Get('shelves/:id/books')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List books on a shelf',
    description:
      'Token is optional. Private shelves are visible only to their owner.',
  })
  @ApiPaginatedResponse(ShelfBookDto)
  findBooks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ShelfBooksQueryDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.shelvesService.findBooks(id, query, user);
  }

  @Public()
  @Get('users/:username/shelves')
  @ApiOperation({ summary: 'List public shelves of a user' })
  @ApiOkResponse({ type: [ShelfDto] })
  findPublicByUsername(@Param('username') username: string) {
    return this.shelvesService.findPublicByUsername(username);
  }
}
