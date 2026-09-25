import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseIsbnPipe } from '../common/pipes/parse-isbn.pipe';
import { EditionDetailDto } from './dto/edition.dto';
import { EditionsService } from './editions.service';

@ApiTags('Editions')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@ApiNotFoundResponse({ type: ErrorResponseDto })
@Public()
@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get('isbn/:isbn')
  @ApiOperation({
    summary: 'Find an edition by ISBN-10 or ISBN-13',
    description: 'Hyphens and spaces are ignored.',
  })
  @ApiParam({ name: 'isbn', example: '978-0-395-59511-4' })
  @ApiOkResponse({ type: EditionDetailDto })
  findByIsbn(@Param('isbn', ParseIsbnPipe) isbn: string) {
    return this.editionsService.findByIsbn(isbn);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get edition details with its book' })
  @ApiOkResponse({ type: EditionDetailDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.editionsService.findOne(id);
  }
}
