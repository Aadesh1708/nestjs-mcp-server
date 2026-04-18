// mcp-client.service.ts
import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import type { ClientConfig } from '@langchain/mcp-adapters/dist/client';
import type { StructuredToolInterface } from '@langchain/core/tools';

@Injectable()
export class McpClientService implements OnModuleInit, OnModuleDestroy {
  private client: MultiServerMCPClient | null = null;
  private toolsCache: StructuredToolInterface[] | null = null;

  constructor(@Inject('MCP_CLIENT_OPTIONS') private options: ClientConfig) {}

  async onModuleInit() {
    // Initialize the client when the module is initialized
    await this.connect();
  }

  async onModuleDestroy() {
    // Clean up connections when the module is destroyed
    await this.disconnect();
  }

  private async connect() {
    // Create a new client instance
    this.client = new MultiServerMCPClient(this.options);

    await this.client.initializeConnections();

    return this.client;
  }

  async getClient(): Promise<MultiServerMCPClient> {
    if (!this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MCP client is not initialized');
    }

    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.toolsCache = null;
    }
  }

  async getTools(...servers: string[]) {
    if (this.toolsCache && servers.length === 0) {
      return this.toolsCache;
    }

    const client = await this.getClient();
    const tools = await client.getTools(...servers);

    if (servers.length === 0) {
      this.toolsCache = tools;
    }

    return tools;
  }
}
