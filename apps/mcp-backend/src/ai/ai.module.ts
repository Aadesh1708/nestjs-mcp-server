import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { McpBackendService } from './../mcp-backend.service';

@Module({
  providers: [AiService, McpBackendService],
  exports: [AiService],
})
export class AiModule {}
