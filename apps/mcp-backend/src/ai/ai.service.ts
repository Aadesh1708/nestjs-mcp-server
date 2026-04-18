import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { StructuredToolInterface } from '@langchain/core/tools';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private llm: ChatOpenAI<ChatOpenAICallOptions> | null = null;

  constructor(private readonly configService: ConfigService) {}

  getLLM() {
    if (!this.llm) {
      this.llm = new ChatOpenAI({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        timeout: 20000,
        maxRetries: 2,
        configuration: {
          baseURL: this.configService.get<string>('GROQ_API_URL'),
          apiKey: this.configService.get<string>('GROQ_API_KEY'),
        },
      });
    }

    return this.llm;
  }

  getAgent({
    llm,
    tools,
  }: {
    llm: ChatOpenAI<ChatOpenAICallOptions>;
    tools: StructuredToolInterface[];
  }) {
    return createReactAgent({
      llm,
      tools,
    });
  }
}
