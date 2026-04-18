import { Injectable } from '@nestjs/common';
import { McpClientService } from './mcp-client/mcp-client.service';
import { AiService } from './ai/ai.service';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { StructuredToolInterface } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

@Injectable()
export class McpBackendService {
  private readonly prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant'],
    ['human', '{input}'],
  ]);

  private llm: ChatOpenAI<ChatOpenAICallOptions> | null = null;
  private agent:
    | ReturnType<typeof createReactAgent>
    | null = null;

  constructor(
    private readonly mcpClientService: McpClientService,
    private readonly aiService: AiService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessage(body: { message: string }) {
    const { message } = body;
    if (!this.llm) {
      this.llm = this.aiService.getLLM();
    }

    if (!this.agent) {
      const tools = await this.mcpClientService.getTools();
      this.agent = this.aiService.getAgent({
        llm: this.llm,
        tools: tools as StructuredToolInterface[],
      });
    }

    const chain = RunnableSequence.from([
      this.prompt,
      this.agent,
      (agentResponse: { messages?: Array<{ content?: unknown }> }) => {
        const messages = agentResponse.messages || [];

        const lastMessage = messages[messages.length - 1];
        const content = lastMessage?.content;
        return typeof content === 'string' ? content : JSON.stringify(content ?? '');
      },
      new StringOutputParser(),
    ]);

    const res = await chain.invoke({
      input: message,
    });

    return res;
  }
}
