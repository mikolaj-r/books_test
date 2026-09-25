import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorDetailDto } from '../dto/error-response.dto';
import { Prisma } from '../../generated/prisma/client';

interface ErrorShape {
  statusCode: number;
  code: string;
  message: string;
  details: ErrorDetailDto[] | null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const error = this.describe(exception);

    if (error.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        ...error,
        path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
        timestamp: new Date().toISOString(),
      },
      error.statusCode,
    );
  }

  private describe(exception: unknown): ErrorShape {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: null,
    };
  }

  private fromHttpException(exception: HttpException): ErrorShape {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    const body =
      typeof response === 'object' && response !== null
        ? (response as Record<string, unknown>)
        : {};
    const message =
      typeof response === 'string'
        ? response
        : Array.isArray(body.message)
          ? body.message.join('; ')
          : typeof body.message === 'string'
            ? body.message
            : exception.message;

    return {
      statusCode,
      code:
        typeof body.code === 'string'
          ? body.code
          : typeof body.errorCode === 'string'
            ? body.errorCode
            : codeFromStatus(statusCode),
      message,
      details: Array.isArray(body.details)
        ? (body.details as ErrorDetailDto[])
        : null,
    };
  }

  private fromPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ErrorShape {
    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.target;
        const fields = Array.isArray(target) ? target.join(', ') : 'field';
        return {
          statusCode: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: `Unique constraint violated on: ${fields}`,
          details: null,
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Record not found',
          details: null,
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'BAD_REQUEST',
          message: 'Related record does not exist',
          details: null,
        };
      default:
        this.logger.error(exception.message);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: null,
        };
    }
  }
}

function codeFromStatus(status: number): string {
  if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'INTERNAL_ERROR';
  }
  return HttpStatus[status] ?? 'INTERNAL_ERROR';
}
