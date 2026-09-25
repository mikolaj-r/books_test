import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { Role } from '../generated/prisma/enums';
import { CreateEditionDto } from './dto/create-edition.dto';
import { EditionDetailDto } from './dto/edition.dto';
import { UpdateEditionDto } from './dto/update-edition.dto';
import { EditionsService } from './editions.service';

@ApiTags('Editions')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiForbiddenResponse({ type: ErrorResponseDto })
@ApiNotFoundResponse({ type: ErrorResponseDto })
@Roles([Role.ADMIN])
@Controller()
export class EditionsAdminController {
  constructor(private readonly editionsService: EditionsService) {}

  @Post('books/:bookId/editions')
  @ApiOperation({ summary: 'Add an edition to a book (admin)' })
  @ApiCreatedResponse({ type: EditionDetailDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'ISBN already exists',
  })
  create(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Body() dto: CreateEditionDto,
  ) {
    return this.editionsService.create(bookId, dto);
  }

  @Patch('editions/:id')
  @ApiOperation({ summary: 'Update an edition (admin)' })
  @ApiOkResponse({ type: EditionDetailDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'ISBN already exists',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEditionDto,
  ) {
    return this.editionsService.update(id, dto);
  }

  @Delete('editions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an edition (admin)',
    description:
      'Ratings and library entries pointing at it keep the book, editionId becomes null.',
  })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.editionsService.remove(id);
  }
}
