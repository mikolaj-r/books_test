import { BadRequestException, ValidationError } from '@nestjs/common';
import { ErrorDetailDto } from '../dto/error-response.dto';

const flatten = (errors: ValidationError[], parent = ''): ErrorDetailDto[] =>
  errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];
    return [...own, ...flatten(error.children ?? [], field)];
  });

export const validationExceptionFactory = (errors: ValidationError[]) =>
  new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: flatten(errors),
  });
