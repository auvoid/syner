import { Controller, Get } from '@nestjs/common';

@Controller('pdf')
export class PdfController {
  constructor() {}

  @Get()
  async helloWorld() {
    return 'Hello';
  }
}
