import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
  @Get('hello')
  getHello2(): string {
    return 'Hello World!';
  }
}
