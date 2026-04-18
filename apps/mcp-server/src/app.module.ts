import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from '@rekog/mcp-nest';
import { AppTool } from './app.tool';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { McpBackendModule } from './../../mcp-backend/src/mcp-backend.module';
import { McpBackendService } from './../../mcp-backend/src/mcp-backend.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
      }),
    }),
    McpModule.forRoot({
      name: 'my-mcp-server',
      version: '1.0.0',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppTool, McpBackendService],
})
export class AppModule {}
