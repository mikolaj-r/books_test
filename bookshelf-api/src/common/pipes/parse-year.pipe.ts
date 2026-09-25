import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseYearPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new BadRequestException(
        'Year must be an integer between 2000 and 2100',
      );
    }
    return year;
  }
}
