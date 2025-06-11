import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  trackVisits() {
    return this.appService.trackVisits();
  }

  @Get('db')
  getValueFromDB() {
    return this.appService.getValueFromDB();
  }
}
