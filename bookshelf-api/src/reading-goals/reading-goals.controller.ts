import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ParseYearPipe } from '../common/pipes/parse-year.pipe';
import { ReadingGoalDto, ReadingGoalSummaryDto } from './dto/reading-goal.dto';
import { UpsertReadingGoalDto } from './dto/upsert-reading-goal.dto';
import { ReadingGoalsService } from './reading-goals.service';

const ApiYearParam = () =>
  ApiParam({ name: 'year', example: 2026, description: '2000-2100' });

@ApiTags('Reading goals')
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Controller()
export class ReadingGoalsController {
  constructor(private readonly readingGoalsService: ReadingGoalsService) {}

  @Get('me/reading-goals')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List own reading goals, newest year first' })
  @ApiOkResponse({ type: [ReadingGoalSummaryDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findMine(@CurrentUser() user: AuthUser) {
    return this.readingGoalsService.findMine(user.id);
  }

  @Put('me/reading-goals/:year')
  @ApiYearParam()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set the reading goal for a year' })
  @ApiOkResponse({ type: ReadingGoalDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('year', ParseYearPipe) year: number,
    @Body() dto: UpsertReadingGoalDto,
  ) {
    return this.readingGoalsService.upsert(user.id, year, dto);
  }

  @Get('me/reading-goals/:year')
  @ApiYearParam()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own reading goal with books read that year' })
  @ApiOkResponse({ type: ReadingGoalDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('year', ParseYearPipe) year: number,
  ) {
    return this.readingGoalsService.findOne(user.id, year);
  }

  @Delete('me/reading-goals/:year')
  @ApiYearParam()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own reading goal' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('year', ParseYearPipe) year: number,
  ) {
    return this.readingGoalsService.remove(user.id, year);
  }

  @Public()
  @Get('users/:username/reading-goals/:year')
  @ApiYearParam()
  @ApiOperation({ summary: 'Get the reading goal of a user for a year' })
  @ApiOkResponse({ type: ReadingGoalDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findByUsername(
    @Param('username') username: string,
    @Param('year', ParseYearPipe) year: number,
  ) {
    return this.readingGoalsService.findByUsername(username, year);
  }
}
