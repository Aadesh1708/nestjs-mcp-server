import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { McpBackendService } from './mcp-backend.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()
export class McpBackendController {
  private readonly logger = new Logger(McpBackendController.name);

  constructor(private readonly mcpBackendService: McpBackendService) {}

  @Get()
  getHello(): string {
    return this.mcpBackendService.getHello();
  }

  @Post()
  async sayHello(@Body() body: SendMessageDto) {
    if (!body?.message?.trim()) {
      throw new BadRequestException('message is required');
    }

    try {
      const res = await this.mcpBackendService.sendMessage(body);
      return {
        message: res,
      };
    } catch (error: unknown) {
      this.logger.error(error);
      this.handleUpstreamError(error);
      throw new InternalServerErrorException(
        'An error occurred while processing the request.',
      );
    }
  }

  private handleUpstreamError(error: unknown): never {
    if (error instanceof Error) {
      const status = this.extractStatus(error);

      if (status === 429 || error.name === 'InsufficientQuotaError') {
        throw new HttpException(
          'AI provider quota or rate limit exceeded. Please retry later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (status === 401 || status === 403) {
        throw new UnauthorizedException(
          'AI provider authentication failed. Check key and API URL.',
        );
      }

      if (status === 503 || status === 504 || error.name === 'AbortError') {
        throw new ServiceUnavailableException(
          'Upstream AI service is unavailable. Please retry later.',
        );
      }
    }

    throw new InternalServerErrorException(
      'An error occurred while processing the request.',
    );
  }

  private extractStatus(error: Error): number | null {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }

    return null;
  }
}
