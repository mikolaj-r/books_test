import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { round2 } from '../common/utils/numbers';
import { paginate, toPaginated } from '../common/utils/pagination';
import { DatabaseService } from '../database/database.service';
import { Prisma, User } from '../generated/prisma/client';
import { ReadingStatus, Role } from '../generated/prisma/enums';
import { MeDto } from './dto/me.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserPrivateDto } from './dto/user-private.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { toUserPrivate, toUserPublic } from './users.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DatabaseService) {}

  async getMe(userId: string): Promise<MeDto> {
    const user = await this.getById(userId);
    return { ...toUserPrivate(user), stats: await this.stats(userId, false) };
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserPrivateDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return toUserPrivate(user);
  }

  async getProfile(username: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { ...toUserPublic(user), stats: await this.stats(user.id, true) };
  }

  async getIdByUsername(username: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.id;
  }

  async findMany(query: UsersQueryDto): Promise<PaginatedDto<UserPrivateDto>> {
    const where: Prisma.UserWhereInput = query.q
      ? {
          OR: [
            { username: { contains: query.q, mode: 'insensitive' } },
            { email: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(query),
      }),
      this.prisma.user.count({ where }),
    ]);
    return toPaginated(users.map(toUserPrivate), total, query);
  }

  async updateRole(
    id: string,
    role: Role,
    actor: AuthUser,
  ): Promise<UserPrivateDto> {
    if (id === actor.id) {
      throw new BadRequestException('You cannot change your own role');
    }
    await this.getById(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return toUserPrivate(user);
  }

  async remove(id: string, actor: AuthUser): Promise<void> {
    if (id === actor.id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.getById(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async getById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async stats(
    userId: string,
    publicOnly: boolean,
  ): Promise<UserStatsDto> {
    const [booksRead, ratings, shelvesCount] = await this.prisma.$transaction([
      this.prisma.libraryEntry.count({
        where: { userId, status: ReadingStatus.READ },
      }),
      this.prisma.rating.aggregate({
        where: { userId },
        _count: true,
        _avg: { value: true },
      }),
      this.prisma.shelf.count({
        where: { userId, ...(publicOnly ? { isPublic: true } : {}) },
      }),
    ]);

    return {
      booksRead,
      ratingsCount: ratings._count,
      averageRating:
        ratings._avg.value === null ? null : round2(ratings._avg.value),
      shelvesCount,
    };
  }
}
