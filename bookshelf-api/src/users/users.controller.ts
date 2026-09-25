import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':username')
  @ApiOperation({ summary: 'Get a public user profile with statistics' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  getProfile(@Param('username') username: string) {
    return this.usersService.getProfile(username);
  }
}
