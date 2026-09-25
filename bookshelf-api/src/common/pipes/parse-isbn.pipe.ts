import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { normalizeIsbn } from '../utils/isbn';

@Injectable()
export class ParseIsbnPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const isbn = normalizeIsbn(value);
    if (!isbn) {
      throw new BadRequestException('Invalid ISBN');
    }
    return isbn;
  }
}
