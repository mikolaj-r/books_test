import { Injectable, NotFoundException } from '@nestjs/common';
import { bookSummaryInclude, toBookSummary } from '../books/books.mapper';
import { toDateOnly } from '../common/utils/dates';
import { DatabaseService } from '../database/database.service';
import { ReadingGoal } from '../generated/prisma/client';
import { ReadingStatus } from '../generated/prisma/enums';
import { UsersService } from '../users/users.service';
import { ReadingGoalDto, ReadingGoalSummaryDto } from './dto/reading-goal.dto';
import { UpsertReadingGoalDto } from './dto/upsert-reading-goal.dto';

@Injectable()
export class ReadingGoalsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async findMine(userId: string): Promise<ReadingGoalSummaryDto[]> {
    const goals = await this.prisma.readingGoal.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
    });
    return Promise.all(
      goals.map(async (goal) =>
        this.summarize(goal, await this.countRead(goal)),
      ),
    );
  }

  async upsert(
    userId: string,
    year: number,
    dto: UpsertReadingGoalDto,
  ): Promise<ReadingGoalDto> {
    const goal = await this.prisma.readingGoal.upsert({
      where: { userId_year: { userId, year } },
      create: { userId, year, targetBooks: dto.targetBooks },
      update: { targetBooks: dto.targetBooks },
    });
    return this.withBooks(goal);
  }

  async findOne(userId: string, year: number): Promise<ReadingGoalDto> {
    return this.withBooks(await this.getGoal(userId, year));
  }

  async remove(userId: string, year: number): Promise<void> {
    const goal = await this.getGoal(userId, year);
    await this.prisma.readingGoal.delete({ where: { id: goal.id } });
  }

  async findByUsername(
    username: string,
    year: number,
  ): Promise<ReadingGoalDto> {
    const userId = await this.usersService.getIdByUsername(username);
    return this.findOne(userId, year);
  }

  private async getGoal(userId: string, year: number): Promise<ReadingGoal> {
    const goal = await this.prisma.readingGoal.findUnique({
      where: { userId_year: { userId, year } },
    });
    if (!goal) {
      throw new NotFoundException('Reading goal not found');
    }
    return goal;
  }

  private readWhere(goal: ReadingGoal) {
    return {
      userId: goal.userId,
      status: ReadingStatus.READ,
      finishedAt: {
        gte: new Date(Date.UTC(goal.year, 0, 1)),
        lte: new Date(Date.UTC(goal.year, 11, 31)),
      },
    };
  }

  private countRead(goal: ReadingGoal): Promise<number> {
    return this.prisma.libraryEntry.count({ where: this.readWhere(goal) });
  }

  private async withBooks(goal: ReadingGoal): Promise<ReadingGoalDto> {
    const entries = await this.prisma.libraryEntry.findMany({
      where: this.readWhere(goal),
      include: { book: { include: bookSummaryInclude } },
      orderBy: [{ finishedAt: 'desc' }, { updatedAt: 'desc' }],
    });
    return {
      ...this.summarize(goal, entries.length),
      books: entries.map((entry) => ({
        ...toBookSummary(entry.book),
        finishedAt: toDateOnly(entry.finishedAt) ?? '',
      })),
    };
  }

  private summarize(
    goal: ReadingGoal,
    booksRead: number,
  ): ReadingGoalSummaryDto {
    return {
      year: goal.year,
      targetBooks: goal.targetBooks,
      booksRead,
      remaining: Math.max(goal.targetBooks - booksRead, 0),
      progressPercent: Math.min(
        Math.round((booksRead / goal.targetBooks) * 100),
        100,
      ),
    };
  }
}
