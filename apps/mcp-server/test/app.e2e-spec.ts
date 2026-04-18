import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { McpServerModule } from './../src/mcp-server.module';

describe('McpBackendController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [McpServerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});