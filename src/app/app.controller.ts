import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Main endpoint to track visits. This one needs to be improved to be more performant. */
  @Get()
  trackVisits() {
    return this.appService.trackVisits();
  }

  /** Endpoint to get the value from the database. Just for testing purposes. */
  @Get('db')
  getValueFromDB() {
    return this.appService.getValueFromDB();
  }
}
